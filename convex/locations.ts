import { mutation, query } from "./_generated/server";
import { v, ConvexError } from "convex/values";
import { locationTypeValidator, timeOfDayValidator } from "./helpers";
import { DataModel, Doc, Id } from "./_generated/dataModel";
import { FunctionReturnType } from "convex/server";
import { api, components } from "./_generated/api";
import {
  requireAuth,
  requireScriptOwnership,
  requireExists,
} from "./model/auth";
import { TableAggregate } from "@convex-dev/aggregate";
import { generateSearchText } from "./model/search";
export type LocationDocument = Doc<"locations">;
export type LocationSceneDocument = Doc<"location_scenes">;

export type LocationsWithScenes = FunctionReturnType<
  typeof api.locations.getLocationsByScriptId
>;
const createLocationWithSceneValidator = v.object({
  script_id: v.id("scripts"),
  name: v.string(),
  type: locationTypeValidator,
  time_of_day: timeOfDayValidator,
  scene_id: v.id("scenes"),
  notes: v.optional(v.string()),
});

export const locationsByScriptAggregate = new TableAggregate<{
  Key: Id<"scripts">;
  Namespace: Id<"scripts">;
  DataModel: DataModel;
  TableName: "locations";
}>(components.aggregate, {
  sortKey: (location) => location.script_id,
  namespace: (doc) => doc.script_id,
});

export const createLocation = mutation({
  args: {
    script_id: v.id("scripts"),
    name: v.string(),
    type: locationTypeValidator,
    time_of_day: timeOfDayValidator,
  },
  handler: async (ctx, args) => {
    await requireAuth(ctx);

    const myScript = await requireScriptOwnership(
      ctx,
      await ctx.db.get(args.script_id),
      "script"
    );

    const existingLocation = await ctx.db
      .query("locations")
      .withIndex("unique_location_per_script", (q) =>
        q
          .eq("script_id", myScript._id)
          .eq("name", args.name)
          .eq("type", args.type)
      )
      .first();

    if (existingLocation) {
      throw new ConvexError(
        `Location ${args.name} - ${args.type} already exists`
      );
    }

    return await ctx.db.insert("locations", {
      ...args,
      searchText: generateSearchText.location({
        name: args.name,
        type: args.type,
        time_of_day: args.time_of_day,
      }),
    });
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

    const existingLocation = await ctx.db
      .query("locations")
      .withIndex("unique_location_per_script", (q) =>
        q
          .eq("script_id", myScript._id)
          .eq("name", args.name)
          .eq("type", args.type)
      )
      .first();

    if (existingLocation) {
      locationId = existingLocation._id;
    } else {
      // Insert new location

      await requireExists(await ctx.db.get(args.scene_id), "scene");
      locationId = await ctx.db.insert("locations", {
        name: args.name,
        type: args.type,
        time_of_day: args.time_of_day,
        script_id: myScript._id,
        searchText: generateSearchText.location({
          name: args.name,
          type: args.type,
          time_of_day: args.time_of_day,
        }),
      });
    }

    // Check if the location is already linked to the scene
    const existingLink = await ctx.db
      .query("location_scenes")
      .withIndex("by_location_scene", (q) =>
        q.eq("location_id", locationId).eq("scene_id", args.scene_id)
      )
      .first();

    if (!existingLink) {
      // Link location to the scene if not already linked
      await ctx.db.insert("location_scenes", {
        location_id: locationId,
        scene_id: args.scene_id,
        notes: args.notes,
      });
    }

    return locationId;
  },
});

export const getLocationsByScriptId = query({
  args: {
    script_id: v.id("scripts"),
    limit: v.optional(v.number()),
    cursor: v.optional(v.string()),
  },
  handler: async (ctx, { script_id, limit, cursor }) => {
    await requireAuth(ctx);

    const myScript = await requireScriptOwnership(
      ctx,
      await ctx.db.get(script_id),
      "script"
    );
    const paginatedLocations = await ctx.db
      .query("locations")
      .withIndex("by_script", (q) => q.eq("script_id", myScript._id))
      .paginate({
        numItems: limit || 25,
        cursor: cursor || null,
      });

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

    const total = await locationsByScriptAggregate.count(ctx, {
      namespace: myScript._id,
      bounds: {
        lower: { key: myScript._id, inclusive: true },
        upper: { key: myScript._id, inclusive: true },
      },
    });

    return {
      locations: locationsWithScenes,
      nextCursor: paginatedLocations.continueCursor,
      total,
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

    return location;
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

    await locationsByScriptAggregate.delete(ctx, location);

    const locationScenes = await ctx.db
      .query("location_scenes")
      .withIndex("by_location", (q) => q.eq("location_id", location._id))
      .collect();

    await Promise.all([
      ...locationScenes.map(async (ls) => await ctx.db.delete(ls._id)),
      ctx.db.delete(location_id),
    ]);
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

    await ctx.db.patch(location_id, { name, type, time_of_day });

    const newLocation = await requireExists(
      await ctx.db.get(location_id),
      "location"
    );

    await locationsByScriptAggregate.replace(ctx, oldLocation, newLocation);
  },
});
