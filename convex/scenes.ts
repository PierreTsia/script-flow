import { httpAction } from "./_generated/server";
import { parseSceneAnalysis } from "@/lib/llm/parser";
import { MistralProvider } from "@/lib/llm/providers/mistral";

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
    const llmResponse = await provider.analyzeScene(text);
    const analysis = parseSceneAnalysis(llmResponse);
    console.log("analysis", analysis);
    return new Response(JSON.stringify({ analysis, pageNumber }), {
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
