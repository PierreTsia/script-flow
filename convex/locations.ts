import { mutation } from "./_generated/server";
import { v, ConvexError } from "convex/values";
import { locationTypeValidator, timeOfDayValidator } from "./helpers";

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
      const { scene_id, ...location } = args;
      locationId = await ctx.db.insert("locations", location);
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
      });
    }

    return locationId;
  },
});
