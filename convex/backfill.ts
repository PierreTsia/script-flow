import { mutation } from "./_generated/server";
import { generateSearchText } from "./model/search";

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
