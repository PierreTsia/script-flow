import { SceneAnalysis } from "./providers";

export function parseSceneAnalysis(
  raw: string
): Omit<SceneAnalysis, "pageNumber"> {
  const jsonString = raw.replace(/```(json)?/g, "").trim();

  // Add pre-validation
  const requiredKeys = ["scene_number", "characters", "props", "locations"];
  if (!requiredKeys.every((k) => jsonString.includes(`"${k}"`))) {
    throw new Error("Missing required JSON keys");
  }

  try {
    const parsed = JSON.parse(jsonString) as Omit<SceneAnalysis, "pageNumber">;

    // Add post-validation
    if (
      typeof parsed.scene_number !== "string" &&
      parsed.scene_number !== null
    ) {
      throw new Error("scene_number must be string or null");
    }
    if (!Array.isArray(parsed.characters))
      throw new Error("characters must be array");

    return parsed;
  } catch (e) {
    console.error("Failed JSON:", jsonString); // Log the problematic JSON
    throw e;
  }
}
