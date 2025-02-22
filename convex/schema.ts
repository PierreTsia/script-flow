import { defineSchema, defineTable } from "convex/server";

import { v } from "convex/values";
import {
  draftCharactersValidator,
  draftLocationsValidator,
  draftPropsValidator,
  characterTypeValidator,
  timeOfDayValidator,
  locationTypeValidator,
} from "./helpers";
import { propTypeValidator } from "./props";

/**
 * Props Classification System
 *
 * Props can be classified as:
 * - ACTIVE: Objects directly handled/manipulated by characters
 * - SET: Static background elements worth tracking
 * - TRANSFORMING: Items that change state during scene
 *
 * A prop's type can vary between scenes, managed through the relationship:
 * - props.type: Default/most common type, used for general classification
 * - prop_scenes.type: Scene-specific type, overrides default when needed
 */
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
    summary: v.optional(v.string()),
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
    sortKey: v.string(),
  })
    .index("unique_scene_constraint", ["script_id", "scene_number"])
    .index("by_script", ["script_id"])
    .index("by_script_and_sort", ["script_id", "sortKey"]),

  characters: defineTable({
    script_id: v.id("scripts"),
    name: v.string(),
    type: characterTypeValidator,
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
    notes: v.optional(v.string()),
  })
    .index("by_character_scene", ["character_id", "scene_id"])
    .index("by_character", ["character_id"])
    .index("by_scene", ["scene_id"]),

  locations: defineTable({
    script_id: v.id("scripts"),
    name: v.string(),
    type: locationTypeValidator,
    time_of_day: timeOfDayValidator,
  })
    .index("unique_location_per_script", ["script_id", "name", "type"])
    .index("by_script", ["script_id"])
    .index("by_type", ["type"])
    .index("by_time_of_day", ["time_of_day"]),
  location_scenes: defineTable({
    location_id: v.id("locations"),
    scene_id: v.id("scenes"),
    notes: v.optional(v.string()),
  })
    .index("by_location_scene", ["location_id", "scene_id"])
    .index("by_location", ["location_id"])
    .index("by_scene", ["scene_id"]),

  props: defineTable({
    script_id: v.id("scripts"),
    name: v.string(),
    quantity: v.number(),
    /** Base type for general classification and search. Can be overridden per scene */
    type: propTypeValidator,
    /** Searchable text combining name and type for filtered queries */
    searchText: v.string(),
  })
    .index("by_script", ["script_id"])
    .index("by_type", ["type"]) // For type-based queries
    .index("unique_prop_per_script", ["script_id", "name"])
    .searchIndex("search_props", {
      searchField: "searchText",
      filterFields: ["script_id", "type"],
    }),
  prop_scenes: defineTable({
    prop_id: v.id("props"),
    scene_id: v.id("scenes"),
    notes: v.optional(v.string()),
    quantity: v.optional(v.number()),
    /**
     * Scene-specific type that can override the base prop type
     * Example: A chair (SET) becomes ACTIVE when used as a weapon
     */
    type: propTypeValidator,
  })
    .index("by_prop_scene", ["prop_id", "scene_id"])
    .index("by_prop", ["prop_id"])
    .index("by_scene", ["scene_id"])
    .index("by_type", ["type"]),

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
