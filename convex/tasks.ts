import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    return identity?.subject
      ? await ctx.db
          .query("tasks")
          .withIndex("by_user", (q) => q.eq("userId", identity.subject))
          .collect()
      : [];
  },
});

export const create = mutation({
  args: {
    title: v.string(),
    status: v.union(
      v.literal("todo"),
      v.literal("in_progress"),
      v.literal("done")
    ),
    createdAt: v.number(),
    updatedAt: v.number(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    const userId = identity?.subject;

    return ctx.db.insert("tasks", {
      ...args,
      userId: userId!,
    });
  },
});

export const remove = mutation({
  args: {
    id: v.id("tasks"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    // Check if user is the owner of the task
    const task = await ctx.db.get(args.id);
    if (task?.userId !== identity?.subject) {
      throw new Error("Unauthorized");
    }
    return ctx.db.delete(args.id);
  },
});

export const updateTaskStatus = mutation({
  args: {
    id: v.id("tasks"),
    status: v.union(
      v.literal("todo"),
      v.literal("in_progress"),
      v.literal("done")
    ),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    const userId = identity?.subject;

    const task = await ctx.db.get(args.id);
    if (task?.userId !== userId) {
      throw new Error("Unauthorized");
    }

    return ctx.db.patch(args.id, {
      status: args.status,
      updatedAt: Date.now(),
    });
  },
});
