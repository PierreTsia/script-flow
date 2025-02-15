import { mutation } from "./_generated/server";
import { v, ConvexError } from "convex/values";
import { characterTypeValidator } from "./helpers";

const createCharacterWithSceneValidator = v.object({
  script_id: v.id("scripts"),
  name: v.string(),
  type: characterTypeValidator,
  aliases: v.optional(v.array(v.string())),
  notes: v.optional(v.string()),
  scene_id: v.id("scenes"),
});

export const createCharacter = mutation({
  args: {
    script_id: v.id("scripts"),
    name: v.string(),
    type: characterTypeValidator,
    aliases: v.optional(v.array(v.string())),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    const characterId = await ctx.db.insert("characters", {
      script_id: args.script_id,
      name: args.name,
      type: args.type,
      aliases: args.aliases,
      notes: args.notes,
      searchText:
        [args.name, ...(args.aliases || [])].join(" ").toLowerCase() +
        ` ${args.type}`,
    });

    return characterId;
  },
});

export const createCharacterWithScene = mutation({
  args: createCharacterWithSceneValidator,
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError("Unauthorized");
    }

    // Check if the character already exists
    let characterId;
    const existingCharacter = await ctx.db
      .query("characters")
      .withIndex("unique_character_per_script", (q) =>
        q
          .eq("script_id", args.script_id)
          .eq("name", args.name)
          .eq("type", args.type)
      )
      .unique();

    if (existingCharacter) {
      characterId = existingCharacter._id;
    } else {
      // Insert new character
      characterId = await ctx.db.insert("characters", {
        script_id: args.script_id,
        name: args.name,
        type: args.type,
        aliases: args.aliases,
        notes: args.notes,
        searchText:
          [args.name, ...(args.aliases || [])].join(" ").toLowerCase() +
          ` ${args.type}`,
      });
    }

    // Check if the character is already linked to the scene
    const existingLink = await ctx.db
      .query("character_scenes")
      .withIndex("by_character_scene", (q) =>
        q.eq("character_id", characterId).eq("scene_id", args.scene_id)
      )
      .first();

    if (!existingLink) {
      // Link character to the scene if not already linked
      await ctx.db.insert("character_scenes", {
        character_id: characterId,
        scene_id: args.scene_id,
      });
    }

    return characterId;
  },
});
