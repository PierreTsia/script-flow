export function parseSceneAnalysis(raw: string): SceneAnalysis {
  // Strip potential markdown code blocks
  const jsonString = raw
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();

  try {
    const parsed = JSON.parse(jsonString) as SceneAnalysis;

    // Basic validation
    if (!parsed.scene_number || !Array.isArray(parsed.characters)) {
      throw new Error("Invalid analysis format");
    }

    return parsed;
  } catch (e) {
    console.error("Failed to parse LLM output:", e);
    throw new Error(`AI response parsing failed: ${(e as Error).message}`);
  }
}

// Add this type near your prompt definitions
export type SceneAnalysis = {
  scene_number: string;
  characters: Array<{
    name: string;
    type: "PRINCIPAL" | "SECONDARY" | "FIGURANT" | "SILHOUETTE" | "EXTRA";
  }>;
  props: Array<{
    name: string;
    quantity: number;
    notes?: string;
  }>;
  locations: Array<{
    name: string;
    type: "INT" | "EXT";
    time_of_day: "DAY" | "NIGHT" | "DAWN" | "DUSK" | "UNSPECIFIED";
  }>;
};
