import {
  httpAction,
  mutation,
  query,
  QueryCtx,
  MutationCtx,
} from "./_generated/server";
import { parseSceneAnalysis } from "@/lib/llm/parser";
import { MistralProvider } from "@/lib/llm/providers/mistral";
import { SceneAnalysis } from "@/lib/llm/providers/index";
import { FunctionReturnType } from "convex/server";

import { ConvexError, v } from "convex/values";
import { Doc, Id } from "@/convex/_generated/dataModel";
import { api } from "./_generated/api";
import {
  requireAuth,
  requireScriptOwnership,
  requireExists,
} from "./model/auth";

import { generateSearchText } from "./model/search";

// 1. Type Exports
export type SceneDocument = Doc<"scenes">;
export type SceneWithEntities = FunctionReturnType<
  typeof api.scenes.getSceneAndEntitiesByNumber
>;

// 2. Validators
const createSceneValidator = v.object({
  script_id: v.id("scripts"),
  scene_number: v.string(),
  page_number: v.number(),
  text: v.string(),
  summary: v.optional(v.string()),
});

const saveDraftValidator = v.object({
  scriptId: v.id("scripts"),
  sceneNumber: v.union(v.string(), v.null()),
  analysis: v.string(),
  text: v.string(),
  pageNumber: v.number(),
});

const updateSceneValidator = v.object({
  sceneId: v.id("scenes"),
  sceneNumber: v.string(),
  summary: v.string(),
  charactersIdsToDelete: v.optional(v.array(v.id("characters"))),
  locationsIdsToDelete: v.optional(v.array(v.id("locations"))),
  propsIdsToDelete: v.optional(v.array(v.id("props"))),
  charactersIdsToAdd: v.optional(v.array(v.id("characters"))),
  locationsIdsToAdd: v.optional(v.array(v.id("locations"))),
  propsIdsToAdd: v.optional(v.array(v.id("props"))),
});

// 3. Internal Helper Functions
const checkExistingScene = async (
  ctx: QueryCtx,
  scriptId: Id<"scripts">,
  sceneNumber: string
) => {
  return await ctx.db
    .query("scenes")
    .withIndex("unique_scene_constraint", (q) =>
      q.eq("script_id", scriptId).eq("scene_number", sceneNumber)
    )
    .unique();
};

const saveNewScene = async (
  ctx: MutationCtx,
  args: {
    script_id: Id<"scripts">;
    scene_number: string;
    page_number: number;
    text: string;
    summary?: string;
  }
) => {
  return await ctx.db.insert("scenes", {
    script_id: args.script_id,
    scene_number: args.scene_number,
    page_number: args.page_number,
    text: args.text,
    summary: args.summary,
    sortKey: sceneNumberToSortKey(args.scene_number),
    searchText: generateSearchText.scene({
      scene_number: args.scene_number,
      page_number: args.page_number,
      text: args.text,
      summary: args.summary,
    }),
  });
};

const sceneNumberToSortKey = (sceneNumber: string): string => {
  const match = sceneNumber.match(/(\d+)([A-Za-z]*)/);
  if (!match) return sceneNumber.padStart(5, "0");

  const [_, num, suffix] = match;
  return num.padStart(5, "0") + (suffix || "");
};

const getSceneCharacters = async (ctx: QueryCtx, sceneId: Id<"scenes">) => {
  const characterScenes = await ctx.db
    .query("character_scenes")
    .withIndex("by_scene", (q) => q.eq("scene_id", sceneId))
    .collect();

  return Promise.all(
    characterScenes.map(async (cs) => ({
      ...(await ctx.db.get(cs.character_id))!,
      notes: cs.notes,
    }))
  );
};

const getSceneLocations = async (ctx: QueryCtx, sceneId: Id<"scenes">) => {
  const locationScenes = await ctx.db
    .query("location_scenes")
    .withIndex("by_scene", (q) => q.eq("scene_id", sceneId))
    .collect();

  return Promise.all(
    locationScenes.map(async (ls) => ({
      ...(await ctx.db.get(ls.location_id))!,
      notes: ls.notes,
    }))
  );
};

const getSceneProps = async (ctx: QueryCtx, sceneId: Id<"scenes">) => {
  const propScenes = await ctx.db
    .query("prop_scenes")
    .withIndex("by_scene", (q) => q.eq("scene_id", sceneId))
    .collect();

  return Promise.all(
    propScenes.map(async (ps) => ({
      ...(await ctx.db.get(ps.prop_id))!,
      notes: ps.notes,
    }))
  );
};

const getSceneEntities = async (ctx: QueryCtx, sceneId: Id<"scenes">) => {
  const [characters, locations, props] = await Promise.all([
    getSceneCharacters(ctx, sceneId),
    getSceneLocations(ctx, sceneId),
    getSceneProps(ctx, sceneId),
  ]);

  return { characters, locations, props };
};

const removeSceneRelationships = async (
  ctx: MutationCtx,
  sceneId: Id<"scenes">
) => {
  const [characterScenes, locationScenes, propScenes] = await Promise.all([
    ctx.db
      .query("character_scenes")
      .withIndex("by_scene", (q) => q.eq("scene_id", sceneId))
      .collect(),
    ctx.db
      .query("location_scenes")
      .withIndex("by_scene", (q) => q.eq("scene_id", sceneId))
      .collect(),
    ctx.db
      .query("prop_scenes")
      .withIndex("by_scene", (q) => q.eq("scene_id", sceneId))
      .collect(),
  ]);

  await Promise.all([
    ...characterScenes.map((cs) => ctx.db.delete(cs._id)),
    ...locationScenes.map((ls) => ctx.db.delete(ls._id)),
    ...propScenes.map((ps) => ctx.db.delete(ps._id)),
  ]);
};

const removeSceneEntities = async (
  ctx: MutationCtx,
  sceneId: Id<"scenes">,
  args: {
    charactersIdsToDelete?: Id<"characters">[];
    locationsIdsToDelete?: Id<"locations">[];
    propsIdsToDelete?: Id<"props">[];
  }
) => {
  await Promise.all([
    ...(args.charactersIdsToDelete ?? []).map((characterId) =>
      ctx.db
        .query("character_scenes")
        .withIndex("by_character_scene", (q) =>
          q.eq("character_id", characterId).eq("scene_id", sceneId)
        )
        .collect()
        .then((docs) => Promise.all(docs.map((doc) => ctx.db.delete(doc._id))))
    ),
    ...(args.locationsIdsToDelete ?? []).map((locationId) =>
      ctx.db
        .query("location_scenes")
        .withIndex("by_location_scene", (q) =>
          q.eq("location_id", locationId).eq("scene_id", sceneId)
        )
        .collect()
        .then((docs) => Promise.all(docs.map((doc) => ctx.db.delete(doc._id))))
    ),
    ...(args.propsIdsToDelete ?? []).map((propId) =>
      ctx.db
        .query("prop_scenes")
        .withIndex("by_prop_scene", (q) =>
          q.eq("prop_id", propId).eq("scene_id", sceneId)
        )
        .collect()
        .then((docs) => Promise.all(docs.map((doc) => ctx.db.delete(doc._id))))
    ),
  ]);
};

const addSceneEntities = async (
  ctx: MutationCtx,
  sceneId: Id<"scenes">,
  args: {
    charactersIdsToAdd?: Id<"characters">[];
    locationsIdsToAdd?: Id<"locations">[];
    propsIdsToAdd?: Id<"props">[];
  }
) => {
  await Promise.all([
    ...(args.charactersIdsToAdd ?? []).map((id) =>
      ctx.db.insert("character_scenes", {
        character_id: id,
        scene_id: sceneId,
        notes: "",
      })
    ),
    ...(args.locationsIdsToAdd ?? []).map((id) =>
      ctx.db.insert("location_scenes", {
        location_id: id,
        scene_id: sceneId,
        notes: "",
      })
    ),
    ...(args.propsIdsToAdd ?? []).map((id) =>
      ctx.db.insert("prop_scenes", {
        prop_id: id,
        scene_id: sceneId,
        notes: "",
        type: "ACTIVE",
      })
    ),
  ]);
};

// 4. API Functions
export const analyzeScene = httpAction(async (ctx, request) => {
  const { text, pageNumber } = await request.json();

  const mistralKey = process.env.MISTRAL_KEY!;
  const clientOrigin = process.env.CLIENT_ORIGIN!;

  // Set in convex dashboard as "https://script-flow.vercel.app/"
  // TODO: deal with the preview urls

  const allowedOrigins = [clientOrigin, "http://localhost:3000"];
  const requestOrigin = request.headers.get("Origin")!;
  const isValidOrigin = allowedOrigins.some(
    (origin) => origin.trim() === requestOrigin
  );
  const corsHeaders = {
    "Access-Control-Allow-Origin": isValidOrigin ? requestOrigin! : "",
    "Access-Control-Allow-Methods": "POST",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  const provider = new MistralProvider({
    apiKey: mistralKey,
    baseURL: "https://api.mistral.ai/v1",
  });

  try {
    const llmResponse: string = await provider.analyzeScene(text);
    console.log("Raw LLM response:", llmResponse);

    const analysis: Omit<SceneAnalysis, "pageNumber"> =
      parseSceneAnalysis(llmResponse);

    const analysisWithPageNumber: SceneAnalysis = {
      ...analysis,
      pageNumber,
    };

    return new Response(JSON.stringify(analysisWithPageNumber), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("LLM Analysis failed:", error);
    return new Response(JSON.stringify({ error }), {
      status: 500,
      headers: corsHeaders,
    });
  }
});

export const saveDraft = mutation({
  args: saveDraftValidator,
  handler: async (ctx, args) => {
    await requireAuth(ctx);
    const myScript = await requireScriptOwnership(
      ctx,
      await ctx.db.get(args.scriptId),
      "script"
    );

    const analysis: SceneAnalysis = JSON.parse(args.analysis);

    const draftId = await ctx.db.insert("draftScenesAnalysis", {
      script_id: myScript._id,
      scene_number: args.sceneNumber,
      locations: analysis.locations,
      characters: analysis.characters,
      props: analysis.props,
      text: args.text,
      summary: analysis.summary || "",
      page_number: args.pageNumber,
    });

    const draft = await ctx.db.get(draftId);
    return draft;
  },
});

export const getDrafts = query({
  args: {
    scriptId: v.id("scripts"),
  },
  handler: async (ctx, args) => {
    await requireAuth(ctx);

    const myScript = await requireScriptOwnership(
      ctx,
      await ctx.db.get(args.scriptId),
      "script"
    );

    return await ctx.db
      .query("draftScenesAnalysis")
      .withIndex("by_script", (q) => q.eq("script_id", myScript._id))
      .collect();
  },
});

export const deleteDraft = mutation({
  args: {
    draftId: v.id("draftScenesAnalysis"),
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.draftId);
  },
});

export const saveScene = mutation({
  args: createSceneValidator,
  handler: async (ctx, args) => {
    await requireAuth(ctx);

    const myScript = await requireScriptOwnership(
      ctx,
      await ctx.db.get(args.script_id),
      "script"
    );

    const existing = await checkExistingScene(
      ctx,
      myScript._id,
      args.scene_number
    );

    if (existing !== null) {
      throw new ConvexError({
        message: `A scene with scene_number "${args.scene_number}" already exists.`,
        code: "DUPLICATE_SCENE",
      });
    }

    return await saveNewScene(ctx, {
      script_id: myScript._id,
      scene_number: args.scene_number,
      page_number: args.page_number,
      text: args.text,
      summary: args.summary,
    });
  },
});

export const getSceneById = query({
  args: { sceneId: v.id("scenes") },
  handler: async (ctx, { sceneId }) => {
    await requireAuth(ctx);
    const scene = await requireExists(await ctx.db.get(sceneId), "scene");

    await requireScriptOwnership(
      ctx,
      await ctx.db.get(scene.script_id),
      "script"
    );

    const entities = await getSceneEntities(ctx, scene._id);

    return {
      ...scene,
      ...entities,
    };
  },
});

export const getSceneAndEntitiesByNumber = query({
  args: {
    scriptId: v.id("scripts"),
    sceneNumber: v.string(),
  },
  handler: async (ctx, { scriptId, sceneNumber }) => {
    await requireAuth(ctx);

    const myScript = await requireScriptOwnership(
      ctx,
      await ctx.db.get(scriptId),
      "script"
    );

    const scene = await requireExists(
      await checkExistingScene(ctx, myScript._id, sceneNumber),
      "scene"
    );

    const entities = await getSceneEntities(ctx, scene._id);

    return {
      ...scene,
      ...entities,
    };
  },
});

export const deleteScene = mutation({
  args: { sceneId: v.id("scenes") },
  handler: async (ctx, args) => {
    await requireAuth(ctx);

    const scene = await requireExists(await ctx.db.get(args.sceneId), "scene");

    await requireScriptOwnership(
      ctx,
      await ctx.db.get(scene.script_id),
      "script"
    );

    await removeSceneRelationships(ctx, args.sceneId);
    await ctx.db.delete(args.sceneId);
  },
});

export const updateScene = mutation({
  args: updateSceneValidator,
  handler: async (ctx, args) => {
    await requireAuth(ctx);

    const scene = await requireExists(await ctx.db.get(args.sceneId), "scene");
    await requireScriptOwnership(
      ctx,
      await ctx.db.get(scene.script_id),
      "script"
    );

    await Promise.all([
      removeSceneEntities(ctx, scene._id, args),
      addSceneEntities(ctx, scene._id, args),
      ctx.db.patch(scene._id, {
        summary: args.summary,
        scene_number: args.sceneNumber,
        sortKey: sceneNumberToSortKey(args.sceneNumber),
        searchText: generateSearchText.scene({
          scene_number: args.sceneNumber,
          page_number: scene.page_number,
          text: scene.text,
          summary: args.summary,
        }),
      }),
    ]);

    return scene._id;
  },
});

export const backfillSceneSortKeys = mutation({
  handler: async (ctx) => {
    const scenes = await ctx.db.query("scenes").collect();
    let updated = 0;
    let errors = 0;

    for (const scene of scenes) {
      try {
        if (!scene.sortKey) {
          await ctx.db.patch(scene._id, {
            sortKey: sceneNumberToSortKey(scene.scene_number),
          });
          updated++;
        }
      } catch (e) {
        console.error(`Failed to update scene ${scene._id}:`, e);
        errors++;
      }
    }

    return {
      processed: scenes.length,
      updated,
      errors,
      skipped: scenes.length - updated - errors,
    };
  },
});
