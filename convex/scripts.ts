import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
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
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }
    const userId = identity.subject;
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
    const identity = await ctx.auth.getUserIdentity();
    const userId = identity?.subject;
    return userId
      ? await ctx.db
          .query("scripts")
          .withIndex("by_user", (q) => q.eq("userId", userId))
          .collect()
      : [];
  },
});

export const deleteScript = mutation({
  args: {
    scriptId: v.id("scripts"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    const userId = identity?.subject;
    const script = await ctx.db.get(args.scriptId);
    if (!script) {
      throw new Error("Script not found");
    }
    if (script.userId !== userId) {
      throw new Error("Unauthorized");
    }

    await ctx.db.delete(args.scriptId);
    await ctx.storage.delete(script.fileId);
  },
});

export const getScript = query({
  args: { scriptId: v.id("scripts") },

  handler: async (ctx, { scriptId }) => {
    const identity = await ctx.auth.getUserIdentity();
    const script = await ctx.db.get(scriptId);

    if (!script) return null;

    const fileUrl = await ctx.storage.getUrl(script.fileId);

    return {
      data: identity?.subject === script.userId ? script : null,
      accessLevel: identity?.subject === script.userId ? "owner" : "viewer",
      authStatus: identity ? "authenticated" : "unauthenticated",
      fileUrl: identity?.subject === script.userId ? fileUrl : null,
    };
  },
});
