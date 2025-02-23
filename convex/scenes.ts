import { httpAction, mutation, query } from "./_generated/server";
import { parseSceneAnalysis } from "@/lib/llm/parser";
import { MistralProvider } from "@/lib/llm/providers/mistral";
import { SceneAnalysis } from "@/lib/llm/providers/index";
import { FunctionReturnType } from "convex/server";

import { ConvexError, v } from "convex/values";
import { Doc } from "@/convex/_generated/dataModel";
import { api } from "./_generated/api";
import { filter } from "convex-helpers/server/filter";
import {
  requireAuth,
  requireScriptOwnership,
  requireExists,
} from "./model/auth";
import { TableAggregate } from "@convex-dev/aggregate";
import { DataModel } from "./_generated/dataModel";
import { components } from "./_generated/api";

export const scenesAggregate = new TableAggregate<{
  Key: null;
  DataModel: DataModel;
  TableName: "scenes";
}>(components.aggregate, {
  sortKey: () => null,
});

export type SceneDocument = Doc<"scenes">;

export type SceneWithEntities = FunctionReturnType<
  typeof api.scenes.getSceneAndEntitiesByNumber
>;

export const sceneNumberToSortKey = (sceneNumber: string): string => {
  const match = sceneNumber.match(/(\d+)([A-Za-z]*)/);
  if (!match) return sceneNumber.padStart(5, "0");

  const [_, num, suffix] = match;
  return num.padStart(5, "0") + (suffix || "");
};

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
  args: {
    scriptId: v.id("scripts"),
    sceneNumber: v.union(v.string(), v.null()),
    analysis: v.string(),
    text: v.string(),
    pageNumber: v.number(),
  },
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
  args: {
    script_id: v.id("scripts"),
    scene_number: v.string(),
    page_number: v.number(),
    text: v.string(),
    summary: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireAuth(ctx);

    const myScript = await requireScriptOwnership(
      ctx,
      await ctx.db.get(args.script_id),
      "script"
    );

    const existing = await ctx.db
      .query("scenes")
      .withIndex("unique_scene_constraint", (q) =>
        q.eq("script_id", myScript._id).eq("scene_number", args.scene_number)
      )
      .unique();

    if (existing !== null) {
      throw new ConvexError({
        message: `A scene with script_id "${args.script_id}" and scene_number "${args.scene_number}" already exists.`,
        code: "DUPLICATE_SCENE",
      });
    }

    const sceneId = await ctx.db.insert("scenes", {
      script_id: myScript._id,
      scene_number: args.scene_number,
      page_number: args.page_number,
      text: args.text,
      summary: args.summary,
      sortKey: sceneNumberToSortKey(args.scene_number),
    });

    const scene = await requireExists(await ctx.db.get(sceneId), "scene");

    await scenesAggregate.insertIfDoesNotExist(ctx, scene);

    return sceneId;
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
      await ctx.db
        .query("scenes")
        .withIndex("unique_scene_constraint", (q) =>
          q.eq("script_id", myScript._id).eq("scene_number", sceneNumber)
        )
        .unique(),
      "scene"
    );

    // Fetch characters with their scene-specific notes
    const characterScenes = await ctx.db
      .query("character_scenes")
      .withIndex("by_scene", (q) => q.eq("scene_id", scene._id))
      .collect();

    const characters = await Promise.all(
      characterScenes.map(async (cs) => ({
        ...(await ctx.db.get(cs.character_id)),
        notes: cs.notes,
      }))
    );

    const locations = await ctx.db
      .query("location_scenes")
      .withIndex("by_scene", (q) => q.eq("scene_id", scene._id))
      .collect();

    const props = await ctx.db
      .query("prop_scenes")
      .withIndex("by_scene", (q) => q.eq("scene_id", scene._id))
      .collect();

    return {
      ...scene,
      characters,
      locations,
      props,
    };
  },
});

export const deleteScene = mutation({
  args: {
    sceneId: v.id("scenes"),
  },
  handler: async (ctx, args) => {
    await requireAuth(ctx);

    const scene = await requireExists(await ctx.db.get(args.sceneId), "scene");

    await requireScriptOwnership(
      ctx,
      await ctx.db.get(scene.script_id),
      "script"
    );

    // Collect all records to delete
    const characterScenes = await ctx.db
      .query("character_scenes")
      .withIndex("by_scene", (q) => q.eq("scene_id", args.sceneId))
      .collect();

    const locationScenes = await ctx.db
      .query("location_scenes")
      .withIndex("by_scene", (q) => q.eq("scene_id", args.sceneId))
      .collect();

    const propScenes = await ctx.db
      .query("prop_scenes")
      .withIndex("by_scene", (q) => q.eq("scene_id", args.sceneId))
      .collect();

    // Batch all deletions in a single Promise.all
    await Promise.all([
      ctx.db.delete(args.sceneId),
      ...characterScenes.map((cs) => ctx.db.delete(cs._id)),
      ...locationScenes.map((ls) => ctx.db.delete(ls._id)),
      ...propScenes.map((ps) => ctx.db.delete(ps._id)),
    ]);

    await scenesAggregate.delete(ctx, scene!);
  },
});

export const updateScene = mutation({
  args: {
    sceneId: v.id("scenes"),
    sceneNumber: v.string(),
    summary: v.string(),
    charactersIdsToDelete: v.optional(v.array(v.id("characters"))),

    locationsIdsToDelete: v.optional(v.array(v.id("locations"))),
    propsIdsToDelete: v.optional(v.array(v.id("props"))),
    charactersIdsToAdd: v.optional(v.array(v.id("characters"))),
    locationsIdsToAdd: v.optional(v.array(v.id("locations"))),
    propsIdsToAdd: v.optional(v.array(v.id("props"))),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError({
        message: "Unauthorized",
        code: "UNAUTHORIZED",
      });
    }

    const scene = await ctx.db.get(args.sceneId);
    if (!scene) {
      throw new ConvexError({
        message: "Scene not found",
        code: "SCENE_NOT_FOUND",
      });
    }

    const script = await ctx.db.get(scene.script_id);
    if (script?.userId !== identity.subject) {
      throw new ConvexError({
        message: "Unauthorized: Cannot update another user's scene",
        code: "UNAUTHORIZED",
      });
    }

    // find by the charactersIds, locationsIds, propsIds and delete the join tables
    const characterScenesToDelete = await filter(
      ctx.db
        .query("character_scenes")
        .withIndex("by_scene", (q) => q.eq("scene_id", scene._id)),
      (characterScene) =>
        (args.charactersIdsToDelete ?? []).includes(characterScene.character_id)
    ).collect();

    const locationScenesToDelete = await filter(
      ctx.db
        .query("location_scenes")
        .withIndex("by_scene", (q) => q.eq("scene_id", scene._id)),
      (locationScene) =>
        (args.locationsIdsToDelete ?? []).includes(locationScene.location_id)
    ).collect();

    const propScenesToDelete = await filter(
      ctx.db
        .query("prop_scenes")
        .withIndex("by_scene", (q) => q.eq("scene_id", scene._id)),
      (propScene) => (args.propsIdsToDelete ?? []).includes(propScene.prop_id)
    ).collect();

    // Check for duplicate scene number, excluding current scene
    const existingScene = await ctx.db
      .query("scenes")
      .withIndex("unique_scene_constraint", (q) =>
        q.eq("script_id", scene.script_id).eq("scene_number", args.sceneNumber)
      )
      .filter((q) => q.neq(q.field("_id"), args.sceneId))
      .unique();

    if (existingScene !== null) {
      throw new ConvexError({
        message: `A scene with scene_number "${args.sceneNumber}" already exists.`,
        code: "DUPLICATE_SCENE",
      });
    }

    // Combine all DB operations into a single Promise.all
    await Promise.all([
      // Delete existing associations
      ...characterScenesToDelete.map((doc) => ctx.db.delete(doc._id)),
      ...locationScenesToDelete.map((doc) => ctx.db.delete(doc._id)),
      ...propScenesToDelete.map((doc) => ctx.db.delete(doc._id)),

      // Create new associations
      ...(args.charactersIdsToAdd ?? []).map((id) =>
        ctx.db.insert("character_scenes", {
          character_id: id,
          scene_id: scene._id,
          notes: "",
        })
      ),
      ...(args.locationsIdsToAdd ?? []).map((id) =>
        ctx.db.insert("location_scenes", {
          location_id: id,
          scene_id: scene._id,
          notes: "",
        })
      ),
      ...(args.propsIdsToAdd ?? []).map(async (id) => {
        const prop = await requireExists(await ctx.db.get(id), "prop");
        return ctx.db.insert("prop_scenes", {
          prop_id: id,
          scene_id: scene._id,
          notes: "",
          type: prop.type,
        });
      }),

      // Update scene details
      ctx.db.patch(scene._id, {
        summary: args.summary,
        scene_number: args.sceneNumber,
        sortKey: sceneNumberToSortKey(args.sceneNumber),
      }),
    ]);

    const newScene = await ctx.db.get(args.sceneId);

    await scenesAggregate.replaceOrInsert(ctx, scene!, newScene!);

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

// Mutation to initialize/repair the aggregate
export const backfillScenesAggregate = mutation({
  handler: async (ctx) => {
    // First, get accurate count
    const scenes = await ctx.db.query("scenes").collect();

    // Rebuild aggregate
    let updated = 0;
    let errors = 0;

    for (const scene of scenes) {
      try {
        await scenesAggregate.insert(ctx, scene);
        updated++;
      } catch (e) {
        console.error(`Failed to insert scene ${scene._id}:`, e);
        errors++;
      }
    }

    // Verify final count
    const finalCount = await scenesAggregate.count(ctx);

    return {
      actualScenes: scenes.length,
      aggregateCount: finalCount,
      updated,
      errors,
    };
  },
});
