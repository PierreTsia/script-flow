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
  getAuthState,
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
  name: string
): Promise<CharacterDocument | null> => {
  const character = await ctx.db
    .query("characters")
    .withIndex("by_script_name_type", (q) =>
      q.eq("script_id", scriptId).eq("name", name)
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
    const auth = await getAuthState(ctx);
    const character = await ctx.db.get(args.character_id);
    if (!character) return null;
    const characterScenesWithNotes = await getCharacterScenesWithNotes(
      ctx,
      character._id
    );
    return auth?.userId
      ? { ...character, scenes: characterScenesWithNotes }
      : null;
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
      args.name
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
      args.name
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
    cursor: v.optional(v.union(v.string(), v.null())),
    sortBy: v.optional(v.union(v.literal("name"), v.literal("type"))),
    sortOrder: v.optional(v.union(v.literal("asc"), v.literal("desc"))),
  },
  handler: async (
    ctx,
    { script_id, limit, cursor, sortBy = "type", sortOrder = "desc" }
  ) => {
    const auth = await getAuthState(ctx);
    const script = await requireExists(await ctx.db.get(script_id), "script");

    if (!auth?.userId) {
      return { characters: [], nextCursor: null, total: 0 };
    }

    const typeOrder = [
      "PRINCIPAL",
      "SUPPORTING",
      "FEATURED_EXTRA",
      "SILENT_KEY",
      "ATMOSPHERE",
    ] as const;

    const pageSize = limit || 25;

    const paginatedCharacters = await ctx.db
      .query("characters")
      .withIndex("by_script", (q) => q.eq("script_id", script._id))
      .order("asc")
      .paginate({ numItems: pageSize, cursor: cursor || null });

    const sortedCharacters = paginatedCharacters.page.sort((a, b) => {
      if (sortBy === "type" && a.type !== b.type) {
        return sortOrder === "asc"
          ? typeOrder.indexOf(a.type) - typeOrder.indexOf(b.type)
          : typeOrder.indexOf(b.type) - typeOrder.indexOf(a.type);
      } else {
        return sortOrder === "asc"
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name);
      }
    });

    const characterScenes = await Promise.all(
      sortedCharacters.map(async (character) => ({
        ...character,
        scenes: await getCharacterScenes(ctx, character._id),
      }))
    );

    return {
      characters: characterScenes,
      nextCursor: paginatedCharacters.continueCursor,
      total: await getCharactersCount(ctx, script._id),
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

export const mergeCharacters = mutation({
  args: {
    source_character_id: v.id("characters"),
    target_character_id: v.id("characters"),
  },
  handler: async (ctx, args) => {
    await requireAuth(ctx);

    // Get both characters and verify they exist
    const sourceCharacter = await requireExists(
      await ctx.db.get(args.source_character_id),
      "source character"
    );
    const targetCharacter = await requireExists(
      await ctx.db.get(args.target_character_id),
      "target character"
    );

    // Verify they're from the same script
    if (sourceCharacter.script_id !== targetCharacter.script_id) {
      throw new ConvexError("Cannot merge characters from different scripts");
    }

    // Get all scenes that reference the source character
    const sourceScenes = await ctx.db
      .query("character_scenes")
      .withIndex("by_character", (q) =>
        q.eq("character_id", args.source_character_id)
      )
      .collect();

    // Get all scenes that reference the target character
    const targetScenes = await ctx.db
      .query("character_scenes")
      .withIndex("by_character", (q) =>
        q.eq("character_id", args.target_character_id)
      )
      .collect();

    // Create a map for faster lookups
    const targetScenesMap = new Map(
      targetScenes.map((scene) => [scene.scene_id, scene])
    );

    // First, create all new relationships
    for (const sourceScene of sourceScenes) {
      const targetScene = targetScenesMap.get(sourceScene.scene_id);

      if (!targetScene) {
        // Only source character is in this scene - create new relationship
        await ctx.db.insert("character_scenes", {
          character_id: args.target_character_id,
          scene_id: sourceScene.scene_id,
          notes: sourceScene.notes || "",
        });
      } else {
        // Both characters are in this scene - merge notes if they exist
        if (sourceScene.notes || targetScene.notes) {
          const mergedNotes = targetScene.notes
            ? `${targetScene.notes}\n[Merged from ${sourceCharacter.name}]: ${sourceScene.notes || ""}`
            : sourceScene.notes || "";

          await ctx.db.patch(targetScene._id, {
            notes: mergedNotes,
          });
        }
      }
    }

    // Update target character with merged data
    const mergedAliases = Array.from(
      new Set([
        ...(targetCharacter.aliases || []),
        sourceCharacter.name,
        ...(sourceCharacter.aliases || []),
      ])
    )
      .filter(Boolean)
      .filter((alias) => alias !== targetCharacter.name);

    await ctx.db.patch(args.target_character_id, {
      aliases: mergedAliases,
      searchText:
        [targetCharacter.name, ...mergedAliases].join(" ").toLowerCase() +
        ` ${targetCharacter.type}`,
    });

    // Then delete all old relationships
    for (const scene of sourceScenes) {
      await ctx.db.delete(scene._id);
    }

    // Finally delete the source character
    await ctx.db.delete(args.source_character_id);

    return await ctx.db.get(args.target_character_id);
  },
});
