import { mutation, query, QueryCtx } from "./_generated/server";
import { v, ConvexError } from "convex/values";
import { characterTypeValidator } from "./helpers";
import { Doc, Id } from "./_generated/dataModel";
import { FunctionReturnType } from "convex/server";
import { api } from "./_generated/api";
import {
  requireAuth,
  requireScriptOwnership,
  requireExists,
} from "./model/auth";
import { SceneDocument } from "./scenes";

export type CharacterDocument = Doc<"characters">;
export type CharacterSceneDocument = Doc<"character_scenes">;
export type CharacterSceneWithNotes = CharacterSceneDocument & {
  notes: string;
};

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

async function getCharacterScenes(
  ctx: QueryCtx,
  characterId: Id<"characters">
): Promise<(SceneDocument & { notes?: string })[]> {
  const scenes = await ctx.db
    .query("character_scenes")
    .withIndex("by_character", (q) => q.eq("character_id", characterId))
    .collect();

  return Promise.all(
    scenes.map(async (cs) => {
      const scene = await ctx.db.get(cs.scene_id);
      return {
        ...scene!,
        notes: cs.notes,
      };
    })
  );
}

export const getCharacterById = query({
  args: {
    character_id: v.id("characters"),
  },
  handler: async (ctx, args) => {
    await requireAuth(ctx);
    const character = await requireExists(
      await ctx.db.get(args.character_id),
      "character"
    );

    return character;
  },
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
    await requireAuth(ctx);
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
      throw new ConvexError(`Character ${args.name} already exists`);
    }

    const myScript = await requireScriptOwnership(
      ctx,
      await ctx.db.get(args.script_id),
      "script"
    );

    const characterId = await ctx.db.insert("characters", {
      script_id: myScript._id,
      name: args.name,
      type: args.type,
      aliases: args.aliases,
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
    await requireAuth(ctx);

    const myScript = await requireScriptOwnership(
      ctx,
      await ctx.db.get(args.script_id),
      "script"
    );

    // Check if the character already exists
    let characterId;
    const existingCharacter = await ctx.db
      .query("characters")
      .withIndex("unique_character_per_script", (q) =>
        q
          .eq("script_id", myScript._id)
          .eq("name", args.name)
          .eq("type", args.type)
      )
      .unique();

    if (existingCharacter) {
      characterId = existingCharacter._id;
    } else {
      const { name, aliases, type } = args;
      const searchText =
        [name, ...(aliases || [])].join(" ").toLowerCase() + ` ${type}`;

      characterId = await ctx.db.insert("characters", {
        script_id: myScript._id,
        name,
        type,
        aliases,
        searchText,
      });
    }

    // Create the junction with notes
    await ctx.db.insert("character_scenes", {
      character_id: characterId,
      scene_id: args.scene_id,
      notes: args.notes,
    });

    return characterId;
  },
});

export const getCharactersByScriptId = query({
  args: {
    script_id: v.id("scripts"),
    limit: v.optional(v.number()),
    cursor: v.optional(v.string()),
  },
  handler: async (ctx, { script_id, limit, cursor }) => {
    const myScript = await requireScriptOwnership(
      ctx,
      await ctx.db.get(script_id),
      "script"
    );

    const allCharacters = await ctx.db
      .query("characters")
      .withIndex("by_script", (q) => q.eq("script_id", myScript._id))
      .collect();

    const paginatedCharacters = await ctx.db
      .query("characters")
      .withIndex("by_script", (q) => q.eq("script_id", myScript._id))
      .order("asc")
      .paginate({
        numItems: limit || 25,
        cursor: cursor || null,
      });

    const characterScenes = await Promise.all(
      paginatedCharacters.page.map(async (character) => ({
        ...character,
        scenes: await getCharacterScenes(ctx, character._id),
      }))
    );

    // Fetch character-scene relationships with notes

    return {
      characters: characterScenes,
      nextCursor: paginatedCharacters.continueCursor,
      total: allCharacters.length,
    };
  },
});

export const deduplicateCharacter = mutation({
  args: {
    duplicated_character_id: v.id("characters"),
    target_character_id: v.id("characters"),
  },
  handler: async (ctx, args) => {
    await requireAuth(ctx);

    // Check if the characters exist
    const duplicatedCharacter = await requireExists(
      await ctx.db.get(args.duplicated_character_id),
      "character"
    );
    const targetCharacter = await requireExists(
      await ctx.db.get(args.target_character_id),
      "character"
    );

    // Update target character with merged data
    await ctx.db.patch(args.target_character_id, {
      aliases: Array.from(
        new Set([
          ...(targetCharacter.aliases || []),
          duplicatedCharacter.name,
          ...(duplicatedCharacter.aliases || []),
        ])
      ).filter(
        (alias) => alias !== targetCharacter.name // Remove if same as target name
      ),
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
            notes: cs.notes, // Preserve the notes from the duplicated character
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

export const deleteCharacter = mutation({
  args: {
    character_id: v.id("characters"),
  },
  handler: async (ctx, args) => {
    await requireAuth(ctx);

    const characterToDelete = await requireExists(
      await ctx.db.get(args.character_id),
      "character"
    );

    // delete join tables rows
    const characterScenes = await ctx.db
      .query("character_scenes")
      .withIndex("by_character", (q) =>
        q.eq("character_id", characterToDelete._id)
      )
      .collect();

    // Batch delete all related records in a single transaction
    const mutations = [
      ctx.db.delete(characterToDelete._id),
      ...characterScenes.map((cs) => ctx.db.delete(cs._id)),
    ];

    await Promise.all(mutations);
  },
});

export const updateCharacter = mutation({
  args: {
    character_id: v.id("characters"),
    name: v.string(),
    type: characterTypeValidator,
    aliases: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    await requireAuth(ctx);

    const oldCharacter = await requireExists(
      await ctx.db.get(args.character_id),
      "character"
    );

    await ctx.db.patch(oldCharacter._id, {
      name: args.name,
      type: args.type,
      aliases: args.aliases,
    });

    const updatedCharacter = await requireExists(
      await ctx.db.get(oldCharacter._id),
      "character"
    );

    return updatedCharacter;
  },
});
