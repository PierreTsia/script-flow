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
    const allowedOrigin = process.env.CLIENT_ORIGIN!;
    const requestOrigin = headers.get("Origin");

    const isDev = requestOrigin === "http://localhost:3000";
    console.log("requestOrigin", requestOrigin);
    console.log("allowedOrigin", allowedOrigin);
    console.log("isDev", isDev);

    if (
      requestOrigin &&
      headers.get("Access-Control-Request-Method") &&
      headers.get("Access-Control-Request-Headers")
    ) {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin":
            allowedOrigin === requestOrigin || isDev ? requestOrigin : "",
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
