import { httpAction } from "./_generated/server";

export const analyzeScene = httpAction(async (ctx, request) => {
  const { text, pageNumber } = await request.json();

  // Env var access - will explode helpfully if missing
  const mistralKey = process.env.MISTRAL_KEY!;
  const clientOrigin = process.env.CLIENT_ORIGIN!;
  console.log("mistralKey", mistralKey);

  // Set in dashboard as "http://localhost:3000"

  const allowedOrigins = process.env.CLIENT_ORIGINS?.split(",") || [];
  const requestOrigin = request.headers.get("Origin");
  const isValidOrigin = allowedOrigins.some(
    (origin) => origin.trim() === requestOrigin
  );

  const corsHeaders = {
    "Access-Control-Allow-Origin": isValidOrigin ? requestOrigin! : "",
    "Access-Control-Allow-Methods": "POST",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  return new Response(JSON.stringify({ analysis: mistralKey }), {
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });

  /* const response = await fetch("https://api.mistral.ai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${mistralKey}`
    },
    body: JSON.stringify({
      model: "mistral-large-latest",
      messages: [{
        role: "user",
        content: `Analyze this book passage from page ${pageNumber}: ${text}`
      }],
      temperature: 0.7,
      max_tokens: 500
    })
  });

  if (!response.ok) throw new Error(`Mistral choked: ${response.statusText}`);
  const data = await response.json();
  return new Response(JSON.stringify({ analysis: data.choices[0].message.content }), {
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json"
    }
  }); */
});
