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
  draftScenesAnalysis: defineTable({
    script_id: v.id("scripts"),
    scene_number: v.union(v.string(), v.null()),
    page_number: v.number(),
    text: v.string(),
    locations: v.array(
      v.object({
        name: v.string(),
        type: v.union(v.literal("INT"), v.literal("EXT")),
        time_of_day: v.union(
          v.literal("DAY"),
          v.literal("NIGHT"),
          v.literal("DAWN"),
          v.literal("DUSK"),
          v.literal("UNSPECIFIED")
        ),
      })
    ),
    characters: v.array(
      v.object({
        name: v.string(),
        type: v.union(
          v.literal("PRINCIPAL"),
          v.literal("SECONDARY"),
          v.literal("FIGURANT"),
          v.literal("SILHOUETTE"),
          v.literal("EXTRA")
        ),
        description: v.optional(v.string()),
      })
    ),
    props: v.array(
      v.object({
        name: v.string(),
        quantity: v.number(),
        notes: v.optional(v.string()),
      })
    ),
  }).index("by_script", ["script_id"]),
});
