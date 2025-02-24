import { query } from "./_generated/server";
import { v } from "convex/values";
import { requireAuth, requireScriptOwnership } from "./model/auth";
import { Doc } from "./_generated/dataModel";
import { api } from "./_generated/api";

import { FunctionReturnType } from "convex/server";
export type GlobalSearchEntitiesResult = FunctionReturnType<
  typeof api.search.searchEntities
>;

// Type guards with more specific checks
export const isCharacter = (
  entity: SearchableEntity
): entity is Doc<"characters"> => {
  return (
    "name" in entity &&
    "type" in entity &&
    [
      "PRINCIPAL",
      "SUPPORTING",
      "FEATURED_EXTRA",
      "SILENT_KEY",
      "ATMOSPHERE",
    ].includes(entity.type)
  );
};

export const isProp = (entity: SearchableEntity): entity is Doc<"props"> => {
  return (
    "name" in entity &&
    "quantity" in entity &&
    !("aliases" in entity) &&
    !("time_of_day" in entity)
  );
};

export const isLocation = (
  entity: SearchableEntity
): entity is Doc<"locations"> => {
  return (
    "name" in entity &&
    "time_of_day" in entity &&
    "type" in entity &&
    ["INT", "EXT"].includes(entity.type)
  );
};

export const isScene = (entity: SearchableEntity): entity is Doc<"scenes"> => {
  return "scene_number" in entity && "text" in entity && !("name" in entity);
};

// Union type for all searchable entities
type SearchableEntity =
  | Doc<"characters">
  | Doc<"props">
  | Doc<"locations">
  | Doc<"scenes">;

// Type for search results by entity type
type SearchResults = {
  characters: Doc<"characters">[];
  props: Doc<"props">[];
  locations: Doc<"locations">[];
  scenes: Doc<"scenes">[];
};

// Helper to get preview text based on entity type
const getPreviewText = (entity: SearchableEntity): string => {
  if (isCharacter(entity)) return entity.name;
  if (isProp(entity)) return entity.name;
  if (isLocation(entity)) return entity.name;
  if (isScene(entity))
    return `Scene ${entity.scene_number}: ${entity.text.slice(0, 100)}...`;
  return "Unknown entity";
};

export const searchEntities = query({
  args: {
    script_id: v.id("scripts"),
    searchTerm: v.string(),
    entityTypes: v.optional(
      v.array(
        v.union(
          v.literal("character"),
          v.literal("prop"),
          v.literal("location"),
          v.literal("scene")
        )
      )
    ),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { script_id, searchTerm, entityTypes, limit = 10 }) => {
    await requireAuth(ctx);
    const script = await requireScriptOwnership(
      ctx,
      await ctx.db.get(script_id),
      "script"
    );

    const searchResults: SearchResults = {
      characters: [],
      props: [],
      locations: [],
      scenes: [],
    };

    const normalizedSearch = searchTerm.toLowerCase();
    const typesToSearch = entityTypes || [
      "character",
      "prop",
      "location",
      "scene",
    ];

    await Promise.all(
      typesToSearch.map(async (type) => {
        switch (type) {
          case "character":
            searchResults.characters = await ctx.db
              .query("characters")
              .withSearchIndex("search_characters", (q) =>
                q
                  .search("searchText", normalizedSearch)
                  .eq("script_id", script._id)
              )
              .take(limit);
            break;

          case "prop":
            searchResults.props = await ctx.db
              .query("props")
              .withSearchIndex("search_props", (q) =>
                q
                  .search("searchText", normalizedSearch)
                  .eq("script_id", script._id)
              )
              .take(limit);
            break;

          case "location":
            searchResults.locations = await ctx.db
              .query("locations")
              .withSearchIndex("search_locations", (q) =>
                q
                  .search("searchText", normalizedSearch)
                  .eq("script_id", script._id)
              )
              .take(limit);
            break;

          case "scene":
            searchResults.scenes = await ctx.db
              .query("scenes")
              .withSearchIndex("search_scenes", (q) =>
                q
                  .search("searchText", normalizedSearch)
                  .eq("script_id", script._id)
              )
              .take(limit);
            break;
        }
      })
    );

    // Format results with type safety
    const formattedResults = Object.entries(searchResults).flatMap(
      ([type, results]) =>
        results.map((result) => ({
          entityType: type.slice(0, -1) as
            | "character"
            | "prop"
            | "location"
            | "scene",
          preview: getPreviewText(result),
          ...result,
        }))
    );

    return formattedResults;
  },
});
