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
    storageId: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }
    const userId = identity.subject;
    await ctx.db.insert("scripts", {
      userId,
      storageId: args.storageId,
    });
  },
});

export const getAll = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    const userId = identity?.subject;
    const scripts = await ctx.db
      .query("scripts")
      .filter((q) => q.eq(q.field("userId"), userId))
      .collect();
    return scripts;
  },
});
