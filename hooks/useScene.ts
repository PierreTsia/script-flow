import { useState } from "react";

const API_URL = "https://animated-mole-731.convex.site";

export const useScene = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyze = async (text: string, pageNumber: number) => {
    console.log("Analyzing text:", text);
    if (isAnalyzing) return; // Prevent double-submission

    setIsAnalyzing(true);
    setError(null);
    console.log("checking early return:", text);

    try {
      const response = await fetch(`${API_URL}/analyze-scene`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, pageNumber }),
      });

      if (!response.ok) {
        throw new Error(`Analysis failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analysis request failed");
      throw err;
    } finally {
      setIsAnalyzing(false);
      console.log("setting isAnalyzing to false");
    }
  };

  return { analyze, isAnalyzing, error };
};
