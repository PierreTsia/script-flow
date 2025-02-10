import { defineSchema, defineTable } from "convex/server";

import { v } from "convex/values";

export default defineSchema({
  tasks: defineTable({
    userId: v.string(),
    title: v.string(),
    status: v.union(
      v.literal("todo"),
      v.literal("in_progress"),
      v.literal("done")
    ),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_user", ["userId"]),
  scripts: defineTable({
    userId: v.string(),
    fileId: v.string(),
    name: v.string(),
    uploadedAt: v.number(),
  }).index("by_user", ["userId"]),
});
