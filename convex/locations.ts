import { mutation, MutationCtx, query, QueryCtx } from "./_generated/server";
import { v, ConvexError } from "convex/values";
import {
  LocationType,
  locationTypeValidator,
  TimeOfDay,
  timeOfDayValidator,
} from "./helpers";
import { Doc, Id } from "./_generated/dataModel";
import { FunctionReturnType } from "convex/server";
import { api } from "./_generated/api";
import {
  requireAuth,
  requireScriptOwnership,
  requireExists,
  getAuthState,
} from "./model/auth";
import { generateSearchText } from "./model/search";
import { SceneDocument } from "./scenes";
// 1. Type Exports
export type LocationDocument = Doc<"locations">;
export type LocationSceneDocument = Doc<"location_scenes">;
export type LocationsWithScenes = FunctionReturnType<
  typeof api.locations.getLocationsByScriptId
>;

// 2. Validators
const createLocationValidator = v.object({
  script_id: v.id("scripts"),
  name: v.string(),
  type: locationTypeValidator,
  time_of_day: timeOfDayValidator,
});

const createLocationWithSceneValidator = v.object({
  script_id: v.id("scripts"),
  name: v.string(),
  type: locationTypeValidator,
  time_of_day: timeOfDayValidator,
  scene_id: v.id("scenes"),
  notes: v.optional(v.string()),
});

// 3. Internal Helper Functions
const checkExistingLocation = async (
  ctx: QueryCtx,
  scriptId: Id<"scripts">,
  name: string,
  type: LocationType
) => {
  return await ctx.db
    .query("locations")
    .withIndex("unique_location_per_script", (q) =>
      q.eq("script_id", scriptId).eq("name", name).eq("type", type)
    )
    .first();
};

const saveNewLocation = async (
  ctx: MutationCtx,
  args: {
    script_id: Id<"scripts">;
    name: string;
    type: LocationType;
    time_of_day: TimeOfDay;
  }
) => {
  return await ctx.db.insert("locations", {
    ...args,
    searchText: generateSearchText.location({
      name: args.name,
      type: args.type,
      time_of_day: args.time_of_day,
    }),
  });
};

const addLocationToScene = async (
  ctx: MutationCtx,
  locationId: Id<"locations">,
  sceneId: Id<"scenes">,
  notes?: string
) => {
  const existingLink = await ctx.db
    .query("location_scenes")
    .withIndex("by_location_scene", (q) =>
      q.eq("location_id", locationId).eq("scene_id", sceneId)
    )
    .first();

  if (!existingLink) {
    await ctx.db.insert("location_scenes", {
      location_id: locationId,
      scene_id: sceneId,
      notes,
    });
  }

  return locationId;
};

const getLocationsCount = async (ctx: QueryCtx, scriptId: Id<"scripts">) => {
  const locations = await ctx.db
    .query("locations")
    .withIndex("by_script", (q) => q.eq("script_id", scriptId))
    .collect();
  return locations.length;
};

const getLocationWithScenes = async (
  ctx: QueryCtx,
  locationId: Id<"locations">
): Promise<(SceneDocument & { notes?: string })[]> => {
  const locationScenes = await ctx.db
    .query("location_scenes")
    .withIndex("by_location", (q) => q.eq("location_id", locationId))
    .collect();

  return Promise.all(
    locationScenes.map(async (ls) => ({
      ...(await ctx.db.get(ls.scene_id))!,
      notes: ls.notes,
    }))
  );
};

const removeLocationFromScenes = async (
  ctx: MutationCtx,
  locationId: Id<"locations">
) => {
  const locationScenes = await ctx.db
    .query("location_scenes")
    .withIndex("by_location", (q) => q.eq("location_id", locationId))
    .collect();

  return await Promise.all(locationScenes.map((ls) => ctx.db.delete(ls._id)));
};

// 4. Original Mutations and Queries follow...
export const createLocation = mutation({
  args: createLocationValidator,
  handler: async (ctx, args) => {
    await requireAuth(ctx);

    const myScript = await requireScriptOwnership(
      ctx,
      await ctx.db.get(args.script_id),
      "script"
    );

    const existingLocation = await checkExistingLocation(
      ctx,
      myScript._id,
      args.name,
      args.type
    );

    if (existingLocation) {
      throw new ConvexError(
        `Location ${args.name} - ${args.type} already exists`
      );
    }

    return await saveNewLocation(ctx, args);
  },
});

export const createLocationWithScene = mutation({
  args: createLocationWithSceneValidator,
  handler: async (ctx, args) => {
    await requireAuth(ctx);

    const myScript = await requireScriptOwnership(
      ctx,
      await ctx.db.get(args.script_id),
      "script"
    );

    // Check if the location already exists
    let locationId;
    const existingLocation = await checkExistingLocation(
      ctx,
      myScript._id,
      args.name,
      args.type
    );

    if (existingLocation) {
      locationId = existingLocation._id;
    } else {
      await requireExists(await ctx.db.get(args.scene_id), "scene");
      const { script_id, name, type, time_of_day } = args;
      locationId = await saveNewLocation(ctx, {
        script_id,
        name,
        type,
        time_of_day,
      });
    }

    return await addLocationToScene(ctx, locationId, args.scene_id, args.notes);
  },
});

export const getLocationsByScriptId = query({
  args: {
    script_id: v.id("scripts"),
    limit: v.optional(v.number()),
    cursor: v.optional(v.string()),
    sortBy: v.optional(
      v.union(v.literal("name"), v.literal("type"), v.literal("scenesCount"))
    ),
    sortOrder: v.optional(v.union(v.literal("asc"), v.literal("desc"))),
  },
  handler: async (
    ctx,
    { script_id, limit, cursor, sortBy = "name", sortOrder = "asc" }
  ) => {
    const auth = await getAuthState(ctx);
    const script = await requireExists(await ctx.db.get(script_id), "script");

    // Build query with all conditions upfront
    const query = ctx.db
      .query("locations")
      .withIndex("by_script", (q) => q.eq("script_id", script._id))
      // Apply database-level sort for name
      .order(sortBy !== "scenesCount" ? sortOrder : "asc");

    const paginatedLocations = auth?.userId
      ? await query.paginate({
          numItems: limit || 25,
          cursor: cursor || null,
        })
      : { page: [], continueCursor: null };

    const locationsWithScenes = await Promise.all(
      paginatedLocations.page.map(async (location) => {
        const locationScenes = await ctx.db
          .query("location_scenes")
          .withIndex("by_location", (q) => q.eq("location_id", location._id))
          .collect();

        const scenes = await Promise.all(
          locationScenes.map(async (ls) => ({
            ...(await ctx.db.get(ls.scene_id))!,
            notes: ls.notes,
          }))
        );

        return {
          ...location,
          scenes,
        };
      })
    );

    // Apply in-memory sort for type and scenesCount
    if (sortBy === "type" || sortBy === "scenesCount") {
      const sortedLocations = [...locationsWithScenes].sort((a, b) => {
        if (sortBy === "type") {
          const comparison = a.type.localeCompare(b.type);
          return sortOrder === "asc" ? comparison : -comparison;
        } else {
          const diff = a.scenes.length - b.scenes.length;
          return sortOrder === "asc" ? diff : -diff;
        }
      });
      return {
        locations: sortedLocations,
        nextCursor: paginatedLocations.continueCursor,
        total: await getLocationsCount(ctx, script._id),
      };
    }

    // For name sorting, return the database-sorted results directly
    return {
      locations: locationsWithScenes,
      nextCursor: paginatedLocations.continueCursor,
      total: await getLocationsCount(ctx, script._id),
    };
  },
});

export const getLocationById = query({
  args: { location_id: v.id("locations") },
  handler: async (ctx, { location_id }) => {
    await requireAuth(ctx);

    const location = await requireExists(
      await ctx.db.get(location_id),
      "location"
    );

    await requireScriptOwnership(
      ctx,
      await ctx.db.get(location.script_id),
      "script"
    );

    const scenes = await getLocationWithScenes(ctx, location._id);

    return {
      ...location,
      scenes,
    };
  },
});

export const deleteLocation = mutation({
  args: { location_id: v.id("locations") },
  handler: async (ctx, { location_id }) => {
    await requireAuth(ctx);

    const location = await requireExists(
      await ctx.db.get(location_id),
      "location"
    );

    await removeLocationFromScenes(ctx, location._id);
    await ctx.db.delete(location_id);
  },
});

export const updateLocation = mutation({
  args: {
    location_id: v.id("locations"),
    name: v.string(),
    type: locationTypeValidator,
    time_of_day: timeOfDayValidator,
  },
  handler: async (ctx, { location_id, name, type, time_of_day }) => {
    await requireAuth(ctx);

    const oldLocation = await requireExists(
      await ctx.db.get(location_id),
      "location"
    );

    await requireScriptOwnership(
      ctx,
      await ctx.db.get(oldLocation.script_id),
      "script"
    );

    return await ctx.db.patch(location_id, { name, type, time_of_day });
  },
});
