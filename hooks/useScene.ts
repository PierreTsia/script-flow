import { useState } from "react";
import { toast } from "./use-toast";
import { SceneAnalysis } from "@/lib/llm/providers/index";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Doc, Id } from "@/convex/_generated/dataModel";
import { ConvexError } from "convex/values";
const API_URL = "https://animated-mole-731.convex.site";
import { useStableQuery } from "@/hooks/useStableQuery";

export type DraftSceneAnalysis = Doc<"draftScenesAnalysis">;

export const useScene = () => {
  const insertScene = useMutation(api.scenes.saveScene);
  const deleteSceneMutation = useMutation(api.scenes.deleteScene);
  const updateSceneMutation = useMutation(api.scenes.updateScene);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const useGetDrafts = (scriptId: Id<"scripts">) => {
    return useQuery(api.scenes.getDrafts, { scriptId }) || [];
  };
  const deleteDraft = useMutation(api.scenes.deleteDraft);

  const useGetSceneAndEntitiesByNumber = (
    scriptId: Id<"scripts">,
    sceneNumber: string
  ) => {
    return useQuery(api.scenes.getSceneAndEntitiesByNumber, {
      scriptId,
      sceneNumber,
    });
  };

  const useGetSceneById = (sceneId: Id<"scenes">) => {
    return useQuery(api.scenes.getSceneById, { sceneId });
  };

  const useGetLocationsByScriptId = (
    scriptId: Id<"scripts">,
    limit = 25,
    cursor?: string
  ) => {
    return useStableQuery(api.locations.getLocationsByScriptId, {
      script_id: scriptId,
      limit,
      cursor,
    });
  };

  interface GetCharactersParams {
    scriptId: Id<"scripts">;
    limit?: number;
    cursor?: string;
    sortBy?: "name" | "type";
    sortOrder?: "asc" | "desc";
  }

  const useGetCharactersByScriptId = (params: GetCharactersParams) => {
    return useStableQuery(api.characters.getCharactersByScriptId, {
      script_id: params.scriptId,
      limit: params.limit,
      cursor: params.cursor,
      sortBy: params.sortBy,
      sortOrder: params.sortOrder,
    });
  };

  const useGetPropsByScriptId = (
    scriptId: Id<"scripts">,
    limit = 25,
    cursor?: string
  ) => {
    return useStableQuery(api.props.getPropsByScriptId, {
      script_id: scriptId,
      limit,
      cursor,
    });
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

  const analyseAndSaveDraft = async (
    text: string,
    pageNumber: number,
    scriptId: Id<"scripts">
  ) => {
    setIsLoading(true);
    setError(null);
    try {
      const analysis = await analyze(text, pageNumber);
      if (analysis) {
        const draft = await saveDraft({
          scriptId,
          sceneNumber: analysis.scene_number,
          analysis: JSON.stringify(analysis),
          text,
          pageNumber,
        });
        return draft;
      }
      return null;
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

  const deleteScene = async (sceneId: Id<"scenes">) => {
    setIsLoading(true);
    try {
      await deleteSceneMutation({ sceneId });
      toast({
        title: "Scene deleted",
      });
    } catch (error) {
      toast({
        title: `Scene deletion failed: ${error}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateScene = async (
    sceneId: Id<"scenes">,
    sceneNumber: string,
    summary: string,
    charactersIdsToDelete: Id<"characters">[],
    locationsIdsToDelete: Id<"locations">[],
    propsIdsToDelete: Id<"props">[],
    charactersIdsToAdd: Id<"characters">[],
    locationsIdsToAdd: Id<"locations">[],
    propsIdsToAdd: Id<"props">[]
  ) => {
    setIsLoading(true);
    try {
      const updatedSceneId = await updateSceneMutation({
        sceneId,
        sceneNumber,
        summary,
        charactersIdsToDelete,
        locationsIdsToDelete,
        propsIdsToDelete,
        charactersIdsToAdd,
        locationsIdsToAdd,
        propsIdsToAdd,
      });
      toast({
        title: "Scene updated",
      });
      return updatedSceneId;
    } catch (error) {
      toast({
        title: `Scene update failed: ${error}`,
        variant: "destructive",
      });
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
    useGetDrafts,
    handleDeleteDraft,
    useGetSceneAndEntitiesByNumber,
    useGetCharactersByScriptId,
    useGetLocationsByScriptId,
    useGetPropsByScriptId,
    deleteScene,
    updateScene,
    useGetSceneById,
  };
};
