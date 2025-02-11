import { httpRouter } from "convex/server";
import { analyzeScene } from "./scenes";
import { httpAction } from "./_generated/server";

const http = httpRouter();

http.route({
  path: "/analyze-scene", // RESTful naming
  method: "POST",
  handler: analyzeScene,
});

// Required for CORS preflight
http.route({
  path: "/analyze-scene",
  method: "OPTIONS",
  handler: httpAction(async (_, request) => {
    const headers = request.headers;
    const allowedOrigins = process.env.CLIENT_ORIGINS?.split(",") || [];
    const requestOrigin = headers.get("Origin");

    if (
      requestOrigin &&
      headers.get("Access-Control-Request-Method") &&
      headers.get("Access-Control-Request-Headers")
    ) {
      const isValidOrigin = allowedOrigins.some(
        (origin) => origin.trim() === requestOrigin
      );

      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": isValidOrigin ? requestOrigin : "",
          "Access-Control-Allow-Methods": "POST",
          "Access-Control-Allow-Headers": "Content-Type",
          "Access-Control-Max-Age": "86400",
          Vary: "Origin",
        },
      });
    }
    return new Response();
  }),
});
export default http;
