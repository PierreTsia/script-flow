import { mutation, query } from "./_generated/server";
import { generateSearchText } from "./model/search";
import { scenesByScriptAggregate } from "./scenes";
import { locationsByScriptAggregate } from "./locations";
import { propsByScriptAggregate } from "./props";
import { v } from "convex/values";

export const backfillSearchText = mutation({
  args: {},
  handler: async (ctx) => {
    // Backfill locations

    const locations = await ctx.db.query("locations").collect();
    for (const location of locations) {
      await ctx.db.patch(location._id, {
        searchText: generateSearchText.location(location),
      });
    }

    // Backfill scenes
    const scenes = await ctx.db.query("scenes").collect();
    for (const scene of scenes) {
      await ctx.db.patch(scene._id, {
        searchText: generateSearchText.scene(scene),
      });
    }

    // Backfill props
    const props = await ctx.db.query("props").collect();
    for (const prop of props) {
      await ctx.db.patch(prop._id, {
        searchText: generateSearchText.prop(prop),
      });
    }

    // Backfill characters
    const characters = await ctx.db.query("characters").collect();
    for (const character of characters) {
      await ctx.db.patch(character._id, {
        searchText: generateSearchText.character(character),
      });
    }

    return {
      locationsUpdated: locations.length,
      scenesUpdated: scenes.length,
      propsUpdated: props.length,
      charactersUpdated: characters.length,
    };
  },
});

export const backfillLocationsAggregate = mutation({
  args: {
    scriptId: v.id("scripts"),
  },
  handler: async (ctx, args) => {
    await locationsByScriptAggregate.clear(ctx, {
      namespace: args.scriptId,
    });
  },
});

export const backfillScenesAggregate = mutation({
  args: {
    scriptId: v.id("scripts"),
  },
  handler: async (ctx, args) => {
    await scenesByScriptAggregate.clear(ctx, {
      namespace: args.scriptId,
    });
  },
});

export const backfillPropsAggregate = mutation({
  args: {
    scriptId: v.id("scripts"),
  },
  handler: async (ctx, args) => {
    await propsByScriptAggregate.clear(ctx, {
      namespace: args.scriptId,
    });
  },
});

export const backfillAllAggregates = mutation({
  args: {
    scriptId: v.id("scripts"),
  },
  handler: async (ctx, args) => {
    // Clear aggregates for this script
    await locationsByScriptAggregate.clear(ctx, { namespace: args.scriptId });
    await scenesByScriptAggregate.clear(ctx, { namespace: args.scriptId });
    await propsByScriptAggregate.clear(ctx, { namespace: args.scriptId });

    // Query and insert only documents for this script
    const locations = await ctx.db
      .query("locations")
      .withIndex("by_script", (q) => q.eq("script_id", args.scriptId))
      .collect();
    for (const location of locations) {
      await locationsByScriptAggregate.insertIfDoesNotExist(ctx, location);
    }

    const scenes = await ctx.db
      .query("scenes")
      .withIndex("by_script", (q) => q.eq("script_id", args.scriptId))
      .collect();
    for (const scene of scenes) {
      await scenesByScriptAggregate.insertIfDoesNotExist(ctx, scene);
    }

    const props = await ctx.db
      .query("props")
      .withIndex("by_script", (q) => q.eq("script_id", args.scriptId))
      .collect();
    for (const prop of props) {
      await propsByScriptAggregate.insertIfDoesNotExist(ctx, prop);
    }

    return {
      locations: locations.length,
      scenes: scenes.length,
      props: props.length,
    };
  },
});
