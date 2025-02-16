import { mutation, query } from "./_generated/server";
import { v, ConvexError } from "convex/values";
import { characterTypeValidator } from "./helpers";
import { Doc } from "./_generated/dataModel";
import { FunctionReturnType } from "convex/server";
import { api } from "./_generated/api";

export type CharacterDocument = Doc<"characters">;

export type CharactersWithScenes = FunctionReturnType<
  typeof api.characters.getCharactersByScriptId
>;

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

export const getCharactersByScriptId = query({
  args: {
    script_id: v.id("scripts"),
  },
  handler: async (ctx, args) => {
    // Get all characters for this script
    const characters = await ctx.db
      .query("characters")
      .withIndex("by_script", (q) => q.eq("script_id", args.script_id))
      .collect();

    // Get all character_scenes relationships for these characters
    const characterScenes = await Promise.all(
      characters.map(async (character) => {
        const scenes = await ctx.db
          .query("character_scenes")
          .withIndex("by_character", (q) => q.eq("character_id", character._id))
          .collect();

        // For each character_scene, get the actual scene data
        const sceneDetails = await Promise.all(
          scenes.map(async (cs) => {
            const scene = await ctx.db.get(cs.scene_id);
            return {
              id: cs.scene_id,
              scene_number: scene?.scene_number,
              // Add any other scene fields you need
              ...scene,
            };
          })
        );

        return {
          ...character,
          scenes: sceneDetails,
        };
      })
    );

    return characterScenes;
  },
});

export const deduplicateCharacter = mutation({
  args: {
    duplicated_character_id: v.id("characters"),
    target_character_id: v.id("characters"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError("Unauthorized");
    }

    // Check if the characters exist
    const duplicatedCharacter = await ctx.db.get(args.duplicated_character_id);
    const targetCharacter = await ctx.db.get(args.target_character_id);

    if (!duplicatedCharacter || !targetCharacter) {
      throw new ConvexError("Character not found");
    }

    // Update target character with merged data
    await ctx.db.patch(args.target_character_id, {
      aliases: [
        ...(targetCharacter.aliases || []),
        duplicatedCharacter.name,
        ...(duplicatedCharacter.aliases || []),
      ],
      searchText:
        [
          targetCharacter.name,
          ...(targetCharacter.aliases || []),
          duplicatedCharacter.name,
          ...(duplicatedCharacter.aliases || []),
        ]
          .join(" ")
          .toLowerCase() + ` ${targetCharacter.type}`,
    });

    // create new links between character and scenes
    const duplicatedCharacterScenes = await ctx.db
      .query("character_scenes")
      .withIndex("by_character", (q) =>
        q.eq("character_id", duplicatedCharacter._id)
      )
      .collect();

    // Get existing scene relationships for target character
    const existingSceneRelations = await ctx.db
      .query("character_scenes")
      .withIndex("by_character", (q) =>
        q.eq("character_id", args.target_character_id)
      )
      .collect();

    const existingSceneIds = new Set(
      existingSceneRelations.map((r) => r.scene_id)
    );

    // Only create new relationships for scenes that don't already exist
    await Promise.all(
      duplicatedCharacterScenes
        .filter((cs) => !existingSceneIds.has(cs.scene_id))
        .map(async (cs) => {
          await ctx.db.insert("character_scenes", {
            character_id: args.target_character_id,
            scene_id: cs.scene_id,
          });
        })
    );

    // delete all characters scenes from duplicated character
    await Promise.all(
      duplicatedCharacterScenes.map(async (cs) => {
        await ctx.db.delete(cs._id);
      })
    );

    // delete character
    await ctx.db.delete(args.duplicated_character_id);
  },
});
