import { useState } from "react";
import { toast } from "./use-toast";
import { SceneAnalysis } from "@/lib/llm/providers/index";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Doc, Id } from "@/convex/_generated/dataModel";

const API_URL = "https://animated-mole-731.convex.site";

export type DraftSceneAnalysis = Doc<"draftScenesAnalysis">;

export const useScene = (scriptId: Id<"scripts">) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyze = async (
    text: string,
    pageNumber: number
  ): Promise<SceneAnalysis | null> => {
    if (isAnalyzing) return null; // Prevent double-submission

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
    }
  };

  const saveDraft = useMutation(api.scenes.saveDraft);

  const analyseAndSaveDraft = async (text: string, pageNumber: number) => {
    setIsAnalyzing(true);
    setError(null);
    try {
      const analysis = await analyze(text, pageNumber);
      if (analysis) {
        await saveDraft({
          scriptId,
          sceneNumber: analysis.scene_number,
          analysis: JSON.stringify(analysis),
          text,
          pageNumber,
        });
      }
      return analysis;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analysis request failed");
      toast({
        title: `Analysis failed: ${err}`,
        variant: "destructive",
      });
      return null;
    } finally {
      setIsAnalyzing(false);
      setError(null);
    }
  };

  const drafts: DraftSceneAnalysis[] =
    useQuery(api.scenes.getDrafts, { scriptId }) || [];

  const deleteDraft = useMutation(api.scenes.deleteDraft);

  const handleDeleteDraft = async (draftId: Id<"draftScenesAnalysis">) => {
    await deleteDraft({ draftId });
    toast({
      title: "Draft deleted",
    });
  };

  return {
    isAnalyzing,
    error,
    saveDraft,
    analyseAndSaveDraft,
    drafts,
    handleDeleteDraft,
  };
};
