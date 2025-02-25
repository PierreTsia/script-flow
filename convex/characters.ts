import { mutation, query, QueryCtx, MutationCtx } from "./_generated/server";
import { v, ConvexError } from "convex/values";
import { CharacterType, characterTypeValidator } from "./helpers";
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

const getCharacterScenes = async (
  ctx: QueryCtx,
  characterId: Id<"characters">
): Promise<(SceneDocument & { notes?: string })[]> => {
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
};

const getCharacterScenesWithNotes = async (
  ctx: QueryCtx,
  characterId: Id<"characters">
): Promise<(SceneDocument & { notes?: string })[]> => {
  const scenes = await getCharacterScenes(ctx, characterId);
  return scenes.map((cs) => ({ ...cs, notes: cs.notes || "No notes" }));
};

const createNewCharacter = async (
  ctx: MutationCtx,
  scriptId: Id<"scripts">,
  name: string,
  type: CharacterType,
  aliases?: string[]
) => {
  const characterId = await ctx.db.insert("characters", {
    script_id: scriptId,
    name,
    type,
    aliases: aliases || [],
    searchText: [name, ...(aliases || [])].join(" ").toLowerCase() + ` ${type}`,
  });

  return characterId;
};

const getCharacterNyUniqName = async (
  ctx: QueryCtx,
  scriptId: Id<"scripts">,
  name: string,
  type: CharacterType
): Promise<CharacterDocument | null> => {
  const character = await ctx.db
    .query("characters")
    .withIndex("unique_character_per_script", (q) =>
      q.eq("script_id", scriptId).eq("name", name).eq("type", type)
    )
    .unique();

  return character;
};

const getCharactersCount = async (ctx: QueryCtx, scriptId: Id<"scripts">) => {
  const characters = await ctx.db
    .query("characters")
    .withIndex("by_script", (q) => q.eq("script_id", scriptId))
    .collect();
  return characters.length;
};

const addCharacterToScene = async (
  ctx: MutationCtx,
  characterId: Id<"characters">,
  sceneId: Id<"scenes">,
  notes?: string
) => {
  await ctx.db.insert("character_scenes", {
    character_id: characterId,
    scene_id: sceneId,
    notes: notes || "",
  });
};

const removeCharacterFromScenes = async (
  ctx: MutationCtx,
  characterId: Id<"characters">
) => {
  const characterScenes = await ctx.db
    .query("character_scenes")
    .withIndex("by_character", (q) => q.eq("character_id", characterId))
    .collect();

  return await Promise.all(characterScenes.map((cs) => ctx.db.delete(cs._id)));
};

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
    const characterScenesWithNotes = await getCharacterScenesWithNotes(
      ctx,
      character._id
    );
    return { ...character, scenes: characterScenesWithNotes };
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
    const existingCharacter = await getCharacterNyUniqName(
      ctx,
      args.script_id,
      args.name,
      args.type
    );

    if (existingCharacter) {
      throw new ConvexError(`Character ${args.name} already exists`);
    }

    const myScript = await requireScriptOwnership(
      ctx,
      await ctx.db.get(args.script_id),
      "script"
    );

    const characterId = await createNewCharacter(
      ctx,
      myScript._id,
      args.name,
      args.type,
      args.aliases
    );

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

    // We do not want 2 characters with the same name in the same script
    const existingCharacter = await getCharacterNyUniqName(
      ctx,
      myScript._id,
      args.name,
      args.type
    );

    const characterId = existingCharacter
      ? existingCharacter._id // TODO handle the potential types difference
      : await createNewCharacter(
          ctx,
          myScript._id,
          args.name,
          args.type,
          args.aliases
        );

    await addCharacterToScene(ctx, characterId, args.scene_id, args.notes);

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
      total: await getCharactersCount(ctx, myScript._id),
    };
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

    await removeCharacterFromScenes(ctx, characterToDelete._id);

    await ctx.db.delete(characterToDelete._id);
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

// TODO: review this and rename it to mergeCharacters
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
