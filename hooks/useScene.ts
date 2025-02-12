import { useState } from "react";
import { toast } from "./use-toast";
import { SceneAnalysis } from "@/lib/llm/providers/index";
import { log } from "console";

const API_URL = "https://animated-mole-731.convex.site";

export const useScene = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyze = async (
    text: string,
    pageNumber: number
  ): Promise<SceneAnalysis | null> => {
    if (isAnalyzing) return null; // Prevent double-submission

    setIsAnalyzing(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/analyze-scene`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, pageNumber }),
      });

      if (!response.ok) {
        throw new Error(`Analysis failed: ${response.statusText}`);
      }

      const data = await response.json();
      return data as SceneAnalysis;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analysis request failed");
      toast({
        title: `Analysis failed: ${err}`,
        variant: "destructive",
      });
      return null;
    } finally {
      setIsAnalyzing(false);
    }
  };

  return { analyze, isAnalyzing, error };
};
