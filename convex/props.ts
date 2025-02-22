import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { ConvexError } from "convex/values";
import { Doc } from "./_generated/dataModel";
import { FunctionReturnType } from "convex/server";
import { api } from "./_generated/api";
import {
  requireAuth,
  requireExists,
  requireScriptOwnership,
} from "./model/auth";
export type PropDocument = Doc<"props">;
export type PropSceneDocument = Doc<"prop_scenes">;

export type PropsWithScenes = FunctionReturnType<
  typeof api.props.getPropsByScriptId
>;

const createPropValidator = v.object({
  script_id: v.id("scripts"),
  name: v.string(),
  quantity: v.optional(v.number()),
  notes: v.optional(v.string()),
});

const createPropWithSceneValidator = v.object({
  script_id: v.id("scripts"),
  name: v.string(),
  quantity: v.optional(v.number()),
  notes: v.optional(v.string()),
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
    });

    return propId;
  },
});

export const createPropWithScene = mutation({
  args: createPropWithSceneValidator,
  handler: async (ctx, args) => {
    await requireAuth(ctx);

    // Check if the prop already exists
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
      // Insert new prop
      const quantity = args.quantity ?? 1; // Default quantity to 1 if not provided
      const { scene_id, notes, ...propData } = args; // Extract notes
      await requireExists(await ctx.db.get(scene_id), "scene");
      propId = await ctx.db.insert("props", { ...propData, quantity });
    }

    // Create the junction with notes
    await ctx.db.insert("prop_scenes", {
      prop_id: propId,
      scene_id: args.scene_id,
      notes: args.notes, // Put notes here
    });

    return propId;
  },
});

export const getPropsByScriptId = query({
  args: { script_id: v.id("scripts") },
  handler: async (ctx, { script_id }) => {
    await requireAuth(ctx);

    const myScript = await requireScriptOwnership(
      ctx,
      await ctx.db.get(script_id),
      "script"
    );
    // Get all props for this script
    const props = await ctx.db
      .query("props")
      .withIndex("by_script", (q) => q.eq("script_id", myScript._id))
      .collect();

    // Fetch scenes for each prop
    return await Promise.all(
      props.map(async (prop) => {
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
  },
});

export const updateProp = mutation({
  args: { prop_id: v.id("props"), name: v.string(), quantity: v.number() },
  handler: async (ctx, { prop_id, name, quantity }) => {
    await requireAuth(ctx);

    const prop = await requireExists(await ctx.db.get(prop_id), "prop");

    await requireScriptOwnership(
      ctx,
      await ctx.db.get(prop.script_id),
      "script"
    );
    await ctx.db.patch(prop_id, { name, quantity });
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
      ...propScenes.map((ps) => ctx.db.delete(ps._id)),
    ];

    await Promise.all(mutations);
  },
});
