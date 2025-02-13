import { httpAction, mutation, query } from "./_generated/server";
import { parseSceneAnalysis } from "@/lib/llm/parser";
import { MistralProvider } from "@/lib/llm/providers/mistral";
import { SceneAnalysis } from "@/lib/llm/providers/index";

import { v } from "convex/values";

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
    console.log("analysis", analysis);

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
    return new Response(JSON.stringify({ error: "Analysis failed" }), {
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
      .filter((q) => q.eq(q.field("script_id"), args.scriptId))
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
