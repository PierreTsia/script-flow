import { defineSchema, defineTable } from "convex/server";

import { v } from "convex/values";
import {
  draftCharactersValidator,
  draftLocationsValidator,
  draftPropsValidator,
  characterTypeValidator,
} from "./helpers";
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
    locations: draftLocationsValidator,
    characters: draftCharactersValidator,
    props: draftPropsValidator,
  }).index("by_script", ["script_id"]),
  scenes: defineTable({
    script_id: v.id("scripts"),
    scene_number: v.string(),
    page_number: v.number(),
    text: v.string(),
    summary: v.optional(v.string()),
  })
    .index("unique_scene_constraint", ["script_id", "scene_number"])
    .index("by_script", ["script_id"]),
  characters: defineTable({
    script_id: v.id("scripts"),
    name: v.string(),
    type: characterTypeValidator,
    notes: v.optional(v.string()),
    aliases: v.optional(v.array(v.string())),
    searchText: v.string(),
  })
    .index("by_script", ["script_id"])
    .index("unique_character_per_script", ["script_id", "name", "type"])
    .searchIndex("search_characters", {
      searchField: "searchText",
      filterFields: ["script_id", "type"],
    }),
  character_scenes: defineTable({
    character_id: v.id("characters"),
    scene_id: v.id("scenes"),
  })
    .index("by_character", ["character_id"])
    .index("by_scene", ["scene_id"]),

  /* 
  use like so: 

  CREATE A NEW CHARACTER
  await ctx.db.insert("characters", {
  ...otherFields,
  searchText: [name, ...(aliases || [])].join(" ").toLowerCase() + ` ${type}`
});

UPDATE A CHARACTER
export const update = mutation({
  args: {
    characterId: v.id("characters"),
    updates: v.object({
      name: v.optional(v.string()),
      type: v.optional(characterTypeValidator),
      aliases: v.optional(v.array(v.string())),
      notes: v.optional(v.string()),
    }),
  },
  handler: async (ctx, { characterId, updates }) => {
    // Get existing values first
    const existing = await ctx.db.get(characterId);
    if (!existing) throw new Error("Character not found");

    // Merge updates with existing values
    const merged = {
      name: updates.name ?? existing.name,
      type: updates.type ?? existing.type,
      aliases: updates.aliases ?? existing.aliases,
      notes: updates.notes ?? existing.notes,
    };

    // Rebuild searchText whenever name/aliases/type changes
    const newSearchText = [
      merged.name,
      ...(merged.aliases || []), // Handle possible undefined
    ]
      .join(" ")
      .toLowerCase() + ` ${merged.type}`;

    // Update with both user changes and computed searchText
    await ctx.db.patch(characterId, {
      ...updates,
      searchText: newSearchText,
    });
  },
});

SEARCH FOR A CHARACTER
export const searchCharacters = query({ // ← More accurate name
  args: {
    scriptId: v.id("scripts"),
    searchTerm: v.string(),
  },
  handler: async (ctx, { scriptId, searchTerm }) => {
    return await ctx.db
      .query("characters")
      .withSearchIndex("search_characters", (q) =>
        q
          .search("searchText", searchTerm.toLowerCase())
          .eq("script_id", scriptId)
      )
      .collect();
  },
});

// Search by name
await searchCharacters({ scriptId, searchTerm: "Jon Snow" });

// Search by alias
await searchCharacters({ scriptId, searchTerm: "King of the North" });

// Search by type
await searchCharacters({ scriptId, searchTerm: "PRINCIPAL" });

// Mixed terms
await searchCharacters({ scriptId, searchTerm: "snow PRINCIPAL" });
*/
});
