import { httpAction, mutation, query } from "./_generated/server";
import { parseSceneAnalysis } from "@/lib/llm/parser";
import { MistralProvider } from "@/lib/llm/providers/mistral";
import { SceneAnalysis } from "@/lib/llm/providers/index";
import { FunctionReturnType } from "convex/server";

import { ConvexError, v } from "convex/values";
import { Doc } from "@/convex/_generated/dataModel";
import { api } from "./_generated/api";
import { filter } from "convex-helpers/server/filter";
export type SceneDocument = Doc<"scenes">;

export type SceneWithEntities = FunctionReturnType<
  typeof api.scenes.getSceneAndEntitiesByNumber
>;

export const analyzeScene = httpAction(async (ctx, request) => {
  const { text, pageNumber } = await request.json();

  const mistralKey = process.env.MISTRAL_KEY!;
  const clientOrigin = process.env.CLIENT_ORIGIN!;

  // Set in convex dashboard as "https://script-flow.vercel.app/"
  // TODO: deal with the preview urls

  const allowedOrigins = [clientOrigin, "http://localhost:3000"];
  const requestOrigin = request.headers.get("Origin")!;
  console.log("requestOrigin", requestOrigin);
  const isValidOrigin = allowedOrigins.some(
    (origin) => origin.trim() === requestOrigin
  );
  console.log("isValidOrigin", isValidOrigin);
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
    const analysis: SceneAnalysis = JSON.parse(args.analysis);

    await ctx.db.insert("draftScenesAnalysis", {
      script_id: args.scriptId,
      scene_number: args.sceneNumber,
      locations: analysis.locations,
      characters: analysis.characters,
      props: analysis.props,
      text: args.text,
      summary: analysis.summary || "",
      page_number: args.pageNumber,
    });
  },
});

export const getDrafts = query({
  args: {
    scriptId: v.id("scripts"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("draftScenesAnalysis")
      .withIndex("by_script", (q) => q.eq("script_id", args.scriptId))
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
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    const script = await ctx.db.get(args.script_id);
    if (!script) {
      throw new Error("Script not found");
    }

    const existing = await ctx.db
      .query("scenes")
      .withIndex("unique_scene_constraint", (q) =>
        q.eq("script_id", args.script_id).eq("scene_number", args.scene_number)
      )
      .unique();

    if (existing !== null) {
      throw new ConvexError({
        message: `A scene with script_id "${args.script_id}" and scene_number "${args.scene_number}" already exists.`,
        code: "DUPLICATE_SCENE",
      });
    }

    const sceneId = await ctx.db.insert("scenes", {
      script_id: args.script_id,
      scene_number: args.scene_number,
      page_number: args.page_number,
      text: args.text,
      summary: args.summary,
    });

    return sceneId;
  },
});

export const getSceneAndEntitiesByNumber = query({
  args: {
    scriptId: v.id("scripts"),
    sceneNumber: v.string(),
  },
  handler: async (ctx, { scriptId, sceneNumber }) => {
    const scene = await ctx.db
      .query("scenes")
      .withIndex("unique_scene_constraint", (q) =>
        q.eq("script_id", scriptId).eq("scene_number", sceneNumber)
      )
      .unique();

    if (!scene) {
      return null;
    }

    // Fetch characters with their scene-specific notes
    const characterScenes = await ctx.db
      .query("character_scenes")
      .withIndex("by_scene", (q) => q.eq("scene_id", scene._id))
      .collect();

    const characters = await Promise.all(
      characterScenes.map(async (cs) => ({
        character: await ctx.db.get(cs.character_id),
        notes: cs.notes, // Include notes from junction
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
        message: "Unauthorized: Cannot delete another user's scene",
        code: "UNAUTHORIZED",
      });
    }

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
      ...(args.propsIdsToAdd ?? []).map((id) =>
        ctx.db.insert("prop_scenes", {
          prop_id: id,
          scene_id: scene._id,
          notes: "",
        })
      ),

      // Update scene details
      ctx.db.patch(scene._id, {
        summary: args.summary,
        scene_number: args.sceneNumber,
      }),
    ]);

    return scene._id;
  },
});
