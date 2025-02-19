import { mutation, query } from "./_generated/server";
import { v, ConvexError } from "convex/values";
import { locationTypeValidator, timeOfDayValidator } from "./helpers";
import { Doc } from "./_generated/dataModel";
import { FunctionReturnType } from "convex/server";
import { api } from "./_generated/api";
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

export const createLocationWithScene = mutation({
  args: createLocationWithSceneValidator,
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError("Unauthorized");
    }

    // Check if the location already exists
    let locationId;
    const existingLocation = await ctx.db
      .query("locations")
      .withIndex("unique_location_per_script", (q) =>
        q
          .eq("script_id", args.script_id)
          .eq("name", args.name)
          .eq("type", args.type)
      )
      .first();

    if (existingLocation) {
      locationId = existingLocation._id;
    } else {
      // Insert new location

      const { scene_id, notes, ...locationData } = args;
      console.log("scene_id", scene_id);
      console.log("notes", notes);
      locationId = await ctx.db.insert("locations", locationData);
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
  args: { script_id: v.id("scripts") },
  handler: async (ctx, { script_id }) => {
    const locations = await ctx.db
      .query("locations")
      .withIndex("by_script", (q) => q.eq("script_id", script_id))
      .collect();

    return await Promise.all(
      locations.map(async (location) => {
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
  },
});

export const deleteLocation = mutation({
  args: { location_id: v.id("locations") },
  handler: async (ctx, { location_id }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError("Unauthorized");
    }

    const location = await ctx.db.get(location_id);
    if (!location) {
      throw new ConvexError("Location not found");
    }

    const locationScenes = await ctx.db
      .query("location_scenes")
      .withIndex("by_location", (q) => q.eq("location_id", location_id))
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
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError("Unauthorized");
    }

    const location = await ctx.db.get(location_id);
    if (!location) {
      throw new ConvexError("Location not found");
    }

    await ctx.db.patch(location_id, { name, type, time_of_day });
  },
});
