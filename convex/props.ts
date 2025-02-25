import { mutation, query, QueryCtx, MutationCtx } from "./_generated/server";
import { Infer, v, ConvexError } from "convex/values";
import { Doc, Id } from "./_generated/dataModel";
import { FunctionReturnType } from "convex/server";
import { api } from "./_generated/api";
import {
  requireAuth,
  requireExists,
  requireScriptOwnership,
} from "./model/auth";
import { SceneDocument } from "./scenes";
// 1. Type Exports
export type PropDocument = Doc<"props">;
export type PropSceneDocument = Doc<"prop_scenes">;
export type PropsWithScenes = FunctionReturnType<
  typeof api.props.getPropsByScriptId
>;

export type PropType = Infer<typeof propTypeValidator>;

// 2. Validators
export const propTypeValidator = v.union(
  v.literal("ACTIVE"),
  v.literal("SET"),
  v.literal("TRANSFORMING")
);

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

// 3. Internal Helper Functions
const checkExistingProp = async (
  ctx: QueryCtx,
  scriptId: Id<"scripts">,
  name: string
) => {
  return await ctx.db
    .query("props")
    .withIndex("unique_prop_per_script", (q) =>
      q.eq("script_id", scriptId).eq("name", name)
    )
    .first();
};

const saveNewProp = async (
  ctx: MutationCtx,
  args: {
    script_id: Id<"scripts">;
    name: string;
    quantity: number;
    type: PropType;
  }
) => {
  return await ctx.db.insert("props", {
    script_id: args.script_id,
    name: args.name,
    quantity: args.quantity,
    type: args.type,
    searchText: [args.name, args.type].join(" ").toLowerCase(),
  });
};

const getPropScenes = async (
  ctx: QueryCtx,
  propId: Id<"props">
): Promise<(SceneDocument & { notes?: string })[]> => {
  const propScenes = await ctx.db
    .query("prop_scenes")
    .withIndex("by_prop", (q) => q.eq("prop_id", propId))
    .collect();

  return Promise.all(
    propScenes.map(async (ps) => ({
      ...(await ctx.db.get(ps.scene_id))!,
      notes: ps.notes,
    }))
  );
};

const getPropsCount = async (ctx: QueryCtx, scriptId: Id<"scripts">) => {
  const props = await ctx.db
    .query("props")
    .withIndex("by_script", (q) => q.eq("script_id", scriptId))
    .collect();
  return props.length;
};

const addPropToScene = async (
  ctx: MutationCtx,
  propId: Id<"props">,
  sceneId: Id<"scenes">,
  type: PropType,
  notes?: string
) => {
  const existingLink = await ctx.db
    .query("prop_scenes")
    .withIndex("by_prop_scene", (q) =>
      q.eq("prop_id", propId).eq("scene_id", sceneId)
    )
    .first();

  if (!existingLink) {
    await ctx.db.insert("prop_scenes", {
      prop_id: propId,
      scene_id: sceneId,
      notes,
      type, // Scene-specific type, may differ from base type
    });
  }

  return propId;
};

const removePropFromScenes = async (ctx: MutationCtx, propId: Id<"props">) => {
  const propScenes = await ctx.db
    .query("prop_scenes")
    .withIndex("by_prop", (q) => q.eq("prop_id", propId))
    .collect();

  return await Promise.all(propScenes.map((ps) => ctx.db.delete(ps._id)));
};

export const createProp = mutation({
  args: createPropValidator,
  handler: async (ctx, args) => {
    await requireAuth(ctx);

    const existingProp = await checkExistingProp(
      ctx,
      args.script_id,
      args.name
    );

    if (existingProp) {
      throw new ConvexError(
        `A prop with the name "${args.name}" already exists in this script.`
      );
    }

    const quantity = args.quantity ?? 1;

    return await saveNewProp(ctx, {
      script_id: args.script_id,
      name: args.name,
      quantity,
      type: args.type,
    });
  },
});

export const createPropWithScene = mutation({
  args: createPropWithSceneValidator,
  handler: async (ctx, args) => {
    await requireAuth(ctx);

    let propId;
    const existingProp = await checkExistingProp(
      ctx,
      args.script_id,
      args.name
    );

    if (existingProp) {
      propId = existingProp._id;
    } else {
      // Create new prop with base type
      const { scene_id, type, name, quantity } = args;
      await requireExists(await ctx.db.get(scene_id), "scene");
      propId = await saveNewProp(ctx, {
        script_id: args.script_id,
        name,
        quantity: quantity ?? 1,
        type,
      });
    }

    return await addPropToScene(
      ctx,
      propId,
      args.scene_id,
      args.type,
      args.notes
    );
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
      paginatedProps.page.map(async (prop) => ({
        ...prop,
        scenes: await getPropScenes(ctx, prop._id),
      }))
    );

    return {
      props: propsWithScenes ?? [],
      nextCursor: paginatedProps.continueCursor,
      total: await getPropsCount(ctx, myScript._id),
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

    const scenes = await getPropScenes(ctx, prop._id);

    return {
      ...prop,
      scenes,
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

    return await ctx.db.patch(prop_id, { name, quantity, type });
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

    await removePropFromScenes(ctx, prop._id);
    await ctx.db.delete(prop_id);
  },
});
