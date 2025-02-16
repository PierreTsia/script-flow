import { useState } from "react";
import { toast } from "./use-toast";
import { SceneAnalysis } from "@/lib/llm/providers/index";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Doc, Id } from "@/convex/_generated/dataModel";
import { ConvexError } from "convex/values";
const API_URL = "https://animated-mole-731.convex.site";

export type DraftSceneAnalysis = Doc<"draftScenesAnalysis">;

export const useScene = (scriptId: Id<"scripts">) => {
  const insertScene = useMutation(api.scenes.saveScene);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const drafts = useQuery(api.scenes.getDrafts, { scriptId }) || [];
  const deleteDraft = useMutation(api.scenes.deleteDraft);

  const sceneByNumberQuery = (sceneNumber: string) =>
    useQuery(api.scenes.getSceneAndEntitiesByNumber, {
      scriptId,
      sceneNumber,
    });

  const getSceneAndEntitiesByNumber = (sceneNumber?: string | null) => {
    if (!sceneNumber) return null;
    return sceneByNumberQuery(sceneNumber);
  };

  const charactersByScriptIdQuery = (scriptId: Id<"scripts">) =>
    useQuery(api.characters.getCharactersByScriptId, { script_id: scriptId });

  const getCharactersByScriptId = (scriptId: Id<"scripts">) => {
    if (!scriptId) return null;
    return charactersByScriptIdQuery(scriptId);
  };

  const analyze = async (
    text: string,
    pageNumber: number
  ): Promise<SceneAnalysis | null> => {
    if (isLoading) return null; // Prevent double-submission

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
    setIsLoading(true);
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
      setIsLoading(false);
      setError(null);
    }
  };

  const handleDeleteDraft = async (draftId: Id<"draftScenesAnalysis">) => {
    await deleteDraft({ draftId });
    toast({
      title: "Draft deleted",
    });
  };

  const createScene = async ({
    scene_number,
    page_number,
    script_id,
    text,
    summary,
  }: {
    script_id: Id<"scripts">;
    scene_number: string;
    page_number: number;
    text: string;
    summary?: string;
  }) => {
    setIsLoading(true);
    try {
      const sceneId = await insertScene({
        script_id,
        scene_number,
        page_number,
        text,
        summary,
      });
      toast({
        title: "Scene created",
      });
      return sceneId;
    } catch (error) {
      if (error instanceof ConvexError) {
        toast({
          title: error.data.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: `Scene creation failed: ${error}`,
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    createScene,
    error,
    saveDraft,
    analyseAndSaveDraft,
    drafts,
    handleDeleteDraft,
    getSceneAndEntitiesByNumber,
    getCharactersByScriptId,
  };
};
