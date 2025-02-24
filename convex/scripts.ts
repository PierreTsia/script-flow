import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { scenesByScriptAggregate } from "./scenes";
import {
  requireAuth,
  getAuthState,
  requireScriptOwnership,
} from "./model/auth";

export const getUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    await requireAuth(ctx);
    const url = await ctx.storage.generateUploadUrl();
    return url;
  },
});

export const createNewScriptFromStorageId = mutation({
  args: {
    fileId: v.string(),
    name: v.string(),
  },
  handler: async (ctx, args) => {
    const { userId } = await requireAuth(ctx);
    await ctx.db.insert("scripts", {
      userId,
      fileId: args.fileId,
      name: args.name,
      uploadedAt: Date.now(),
    });
  },
});

export const getAll = query({
  args: {},
  handler: async (ctx) => {
    const auth = await getAuthState(ctx);
    return auth?.userId
      ? await ctx.db
          .query("scripts")
          .withIndex("by_user", (q) => q.eq("userId", auth.userId))
          .collect()
      : [];
  },
});

export const deleteScript = mutation({
  args: {
    scriptId: v.id("scripts"),
  },
  handler: async (ctx, args) => {
    await requireAuth(ctx);

    const myScript = await requireScriptOwnership(
      ctx,
      await ctx.db.get(args.scriptId),
      "script"
    );

    await ctx.db.delete(myScript._id);
    await ctx.storage.delete(myScript.fileId);
  },
});

export const getScript = query({
  args: { scriptId: v.id("scripts") },

  handler: async (ctx, { scriptId }) => {
    const auth = await getAuthState(ctx);
    const myScript = await requireScriptOwnership(
      ctx,
      await ctx.db.get(scriptId),
      "script"
    );

    const fileUrl = await ctx.storage.getUrl(myScript.fileId);

    return {
      data: auth?.userId === myScript.userId ? myScript : null,
      accessLevel: auth?.userId === myScript.userId ? "owner" : "viewer",
      authStatus: auth ? "authenticated" : "unauthenticated",
      fileUrl: auth?.userId === myScript.userId ? fileUrl : null,
    };
  },
});

export const getScriptEntities = query({
  args: {
    scriptId: v.id("scripts"),
    limit: v.optional(v.number()),
    cursor: v.optional(v.string()),
  },
  handler: async (ctx, { scriptId, limit, cursor }) => {
    await requireAuth(ctx);

    const myScript = await requireScriptOwnership(
      ctx,
      await ctx.db.get(scriptId),
      "script"
    );

    // Paginate scenes query
    const paginatedScenes = await ctx.db
      .query("scenes")
      .withIndex("by_script_and_sort", (q) => q.eq("script_id", myScript._id))
      .order("asc")
      .paginate({
        numItems: limit ?? 10,
        cursor: cursor ?? null,
      });

    const scenes = paginatedScenes.page;

    // Fetch all entities for these scenes only
    const characterLinks = await Promise.all(
      scenes.map((scene) =>
        ctx.db
          .query("character_scenes")
          .withIndex("by_scene", (q) => q.eq("scene_id", scene._id))
          .collect()
      )
    ).then((results) => results.flat());

    const characters = await ctx.db
      .query("characters")
      .withIndex("by_script", (q) => q.eq("script_id", scriptId))
      .collect();

    const locationLinks = await Promise.all(
      scenes.map((scene) =>
        ctx.db
          .query("location_scenes")
          .withIndex("by_scene", (q) => q.eq("scene_id", scene._id))
          .collect()
      )
    ).then((results) => results.flat());

    const locations = await ctx.db
      .query("locations")
      .withIndex("by_script", (q) => q.eq("script_id", scriptId))
      .collect();

    const propLinks = await Promise.all(
      scenes.map((scene) =>
        ctx.db
          .query("prop_scenes")
          .withIndex("by_scene", (q) => q.eq("scene_id", scene._id))
          .collect()
      )
    ).then((results) => results.flat());

    const props = await ctx.db
      .query("props")
      .withIndex("by_script", (q) => q.eq("script_id", scriptId))
      .collect();

    // Construct the nested structure for paginated scenes
    const scenesWithEntities = scenes.map((scene) => ({
      ...scene,
      characters: characterLinks
        .filter((link) => link.scene_id === scene._id)
        .map((link) =>
          characters.find((character) => character._id === link.character_id)
        ),
      locations: locationLinks
        .filter((link) => link.scene_id === scene._id)
        .map((link) =>
          locations.find((location) => location._id === link.location_id)
        ),
      props: propLinks
        .filter((link) => link.scene_id === scene._id)
        .map((link) => props.find((prop) => prop._id === link.prop_id)),
    }));

    const totalScenes = await scenesByScriptAggregate.count(ctx, {
      namespace: scriptId,
      bounds: {
        lower: { key: scriptId, inclusive: true },
        upper: { key: scriptId, inclusive: true },
      },
    });

    return {
      script: myScript,
      scenes: scenesWithEntities,
      nextCursor: paginatedScenes.continueCursor,
      total: totalScenes,
    };
  },
});
