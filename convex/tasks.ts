import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { auth } from "@clerk/nextjs/server";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return ctx.db.query("tasks").collect();
  },
});

export const create = mutation({
  args: {
    userId: v.string(),
    title: v.string(),
    status: v.union(
      v.literal("todo"),
      v.literal("in_progress"),
      v.literal("done")
    ),
    createdAt: v.number(),
    updatedAt: v.number(),
  },
  handler: (ctx, args) => {
    return ctx.db.insert("tasks", args);
  },
});
