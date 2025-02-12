import { useState } from "react";

const API_URL = "https://animated-mole-731.convex.site";

export const useScene = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyze = async (text: string, pageNumber: number) => {
    setIsAnalyzing(true);
    try {
      const response = await fetch(`${API_URL}/analyze-scene`, {
        // Match your HTTP route
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, pageNumber }),
      });

      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (err) {
      setError(err instanceof Error ? err.message : "API call failed");
      throw err;
    } finally {
      setIsAnalyzing(false);
    }
  };

  return { analyze, isAnalyzing, error };
};
