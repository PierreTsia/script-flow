import { mutation } from "./_generated/server";
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
