import { useState } from "react";
import { toast } from "./use-toast";

const API_URL = "https://animated-mole-731.convex.site";

export const useScene = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyze = async (text: string, pageNumber: number) => {
    if (isAnalyzing) return; // Prevent double-submission

    setIsAnalyzing(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/analyze-scene-hhh`, {
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
      toast({
        title: `Analysis failed: ${err}`,
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return { analyze, isAnalyzing, error };
};
