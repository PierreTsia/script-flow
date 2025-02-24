import { mutation, query } from "./_generated/server";
import { Infer, v } from "convex/values";
import { ConvexError } from "convex/values";
import { Doc, Id } from "./_generated/dataModel";
import { FunctionReturnType } from "convex/server";
import { api } from "./_generated/api";
import {
  requireAuth,
  requireExists,
  requireScriptOwnership,
} from "./model/auth";

import { TableAggregate } from "@convex-dev/aggregate";
import { DataModel } from "./_generated/dataModel";
import { components } from "./_generated/api";

export type PropDocument = Doc<"props">;
export type PropSceneDocument = Doc<"prop_scenes">;

export type PropsWithScenes = FunctionReturnType<
  typeof api.props.getPropsByScriptId
>;

export const propsByScriptAggregate = new TableAggregate<{
  Key: Id<"scripts">;
  Namespace: Id<"scripts">;
  DataModel: DataModel;
  TableName: "props";
}>(components.aggregate, {
  sortKey: (prop) => prop.script_id,
  namespace: (doc) => doc.script_id,
});

/**
 * Prop Type System
 *
 * Props can change their type based on scene context:
 * - ACTIVE: Used/manipulated by characters
 * - SET: Static background elements
 * - TRANSFORMING: Changes state during scene
 */
export const propTypeValidator = v.union(
  v.literal("ACTIVE"),
  v.literal("SET"),
  v.literal("TRANSFORMING")
);

export type PropType = Infer<typeof propTypeValidator>;

const createPropValidator = v.object({
  script_id: v.id("scripts"),
  name: v.string(),
  quantity: v.optional(v.number()),
  type: propTypeValidator,
  notes: v.optional(v.string()),
});

const createPropWithSceneValidator = v.object({
  script_id: v.id("scripts"),
  name: v.string(),
  quantity: v.optional(v.number()),
  notes: v.optional(v.string()),
  type: propTypeValidator,
  scene_id: v.id("scenes"),
});

export const createProp = mutation({
  args: createPropValidator,
  handler: async (ctx, args) => {
    await requireAuth(ctx);

    const existingProp = await ctx.db
      .query("props")
      .withIndex("unique_prop_per_script", (q) =>
        q.eq("script_id", args.script_id).eq("name", args.name)
      )
      .first();

    if (existingProp) {
      throw new ConvexError(
        `A prop with the name "${args.name}" already exists in this script.`
      );
    }

    const quantity = args.quantity ?? 1;

    const propId = await ctx.db.insert("props", {
      script_id: args.script_id,
      name: args.name,
      quantity,
      type: args.type,
      searchText: [args.name, args.type].join(" ").toLowerCase(),
    });
    const doc = await requireExists(await ctx.db.get(propId), "prop");
    await propsByScriptAggregate.insertIfDoesNotExist(ctx, doc);

    return propId;
  },
});

export const createPropWithScene = mutation({
  args: createPropWithSceneValidator,
  handler: async (ctx, args) => {
    await requireAuth(ctx);

    let propId;
    const existingProp = await ctx.db
      .query("props")
      .withIndex("unique_prop_per_script", (q) =>
        q.eq("script_id", args.script_id).eq("name", args.name)
      )
      .first();

    if (existingProp) {
      propId = existingProp._id;
    } else {
      // Create new prop with base type
      const { scene_id, type, name, quantity } = args;
      await requireExists(await ctx.db.get(scene_id), "scene");
      propId = await ctx.db.insert("props", {
        script_id: args.script_id,
        name,
        quantity: quantity ?? 1,
        type, // Base/default type
        searchText: [name, type].join(" ").toLowerCase(),
      });
      const doc = await requireExists(await ctx.db.get(propId), "prop");
      await propsByScriptAggregate.insertIfDoesNotExist(ctx, doc);
    }

    // Create scene junction with potentially different type
    await ctx.db.insert("prop_scenes", {
      prop_id: propId,
      scene_id: args.scene_id,
      notes: args.notes,
      type: args.type, // Scene-specific type, may differ from base type
    });

    return propId;
  },
});

export const getPropsByScriptId = query({
  args: {
    script_id: v.id("scripts"),
    limit: v.optional(v.number()),
    cursor: v.optional(v.string()),
  },
  handler: async (ctx, { script_id, limit, cursor }) => {
    await requireAuth(ctx);

    const myScript = await requireScriptOwnership(
      ctx,
      await ctx.db.get(script_id),
      "script"
    );

    // Get all props for this script
    const paginatedProps = await ctx.db
      .query("props")
      .withIndex("by_script", (q) => q.eq("script_id", myScript._id))
      .order("desc")
      .paginate({
        numItems: limit ?? 10,
        cursor: cursor ?? null,
      });

    // Fetch scenes for each prop
    const propsWithScenes = await Promise.all(
      paginatedProps.page.map(async (prop) => {
        const propScenes = await ctx.db
          .query("prop_scenes")
          .withIndex("by_prop", (q) => q.eq("prop_id", prop._id))
          .collect();

        const scenes = await Promise.all(
          propScenes.map(async (ps) => {
            const scene = await ctx.db.get(ps.scene_id);
            return {
              ...scene!,
              notes: ps.notes,
            };
          })
        );

        return {
          ...prop,
          scenes,
        };
      })
    );

    const allProps = await ctx.db
      .query("props")
      .withIndex("by_script", (q) => q.eq("script_id", myScript._id))
      .collect();

    return {
      props: propsWithScenes ?? [],
      nextCursor: paginatedProps.continueCursor,
      total: allProps.length,
    };
  },
});

export const getPropById = query({
  args: { prop_id: v.id("props") },
  handler: async (ctx, { prop_id }) => {
    await requireAuth(ctx);

    const prop = await requireExists(await ctx.db.get(prop_id), "prop");

    await requireScriptOwnership(
      ctx,
      await ctx.db.get(prop.script_id),
      "script"
    );

    const propScenes = await ctx.db
      .query("prop_scenes")
      .withIndex("by_prop", (q) => q.eq("prop_id", prop_id))
      .collect();

    // Map scenes with their junction data
    const scenesWithDetails = await Promise.all(
      propScenes.map(async (ps) => {
        const scene = await ctx.db.get(ps.scene_id);
        return {
          ...scene,
          notes: ps.notes, // Include notes from prop_scenes
        };
      })
    );

    return {
      ...prop,
      scenes: scenesWithDetails,
    };
  },
});

export const updateProp = mutation({
  args: {
    prop_id: v.id("props"),
    name: v.string(),
    quantity: v.number(),
    type: propTypeValidator,
  },
  handler: async (ctx, { prop_id, name, quantity, type }) => {
    await requireAuth(ctx);

    const oldProp = await requireExists(await ctx.db.get(prop_id), "prop");

    await requireScriptOwnership(
      ctx,
      await ctx.db.get(oldProp.script_id),
      "script"
    );
    await ctx.db.patch(prop_id, { name, quantity, type });

    const newProp = await requireExists(await ctx.db.get(prop_id), "prop");

    await propsByScriptAggregate.replaceOrInsert(ctx, oldProp, newProp);
  },
});

export const getTotalProps = query({
  args: {
    script_id: v.id("scripts"),
  },
  handler: async (ctx, { script_id }) => {
    const myScript = await requireScriptOwnership(
      ctx,
      await ctx.db.get(script_id),
      "script"
    );
    return await propsByScriptAggregate.count(ctx, {
      namespace: myScript._id,
      bounds: {
        lower: { key: myScript._id, inclusive: true },
        upper: { key: myScript._id, inclusive: true },
      },
    });
  },
});

export const deleteProp = mutation({
  args: { prop_id: v.id("props") },
  handler: async (ctx, { prop_id }) => {
    await requireAuth(ctx);

    const prop = await requireExists(await ctx.db.get(prop_id), "prop");

    await requireScriptOwnership(
      ctx,
      await ctx.db.get(prop.script_id),
      "script"
    );

    const propScenes = await ctx.db
      .query("prop_scenes")
      .withIndex("by_prop", (q) => q.eq("prop_id", prop_id))
      .collect();

    const mutations = [
      ctx.db.delete(prop_id),
      propsByScriptAggregate.delete(ctx, prop),
      ...propScenes.map((ps) => ctx.db.delete(ps._id)),
    ];

    await Promise.all(mutations);
  },
});
