import { useState, useEffect } from "react";

export interface DraftSceneAnalysis {
  scriptId: string;
  sceneNumber: string;
  analysis: string;
  timestamp: number;
}

export function useDraftScenesAnalysis(scriptId: string) {
  const [drafts, setDrafts] = useState<DraftSceneAnalysis[]>(() => {
    if (typeof window === "undefined") return [];
    const saved = localStorage.getItem("draftScenes");
    return saved
      ? JSON.parse(saved).filter(
          (d: DraftSceneAnalysis) => d.scriptId === scriptId
        )
      : [];
  });

  // Sync to local storage
  useEffect(() => {
    if (typeof window === "undefined") return;

    const allDrafts = JSON.parse(
      localStorage.getItem("draftScenes") || "[]"
    ).filter((d: DraftSceneAnalysis) => d.scriptId !== scriptId);

    localStorage.setItem(
      "draftScenes",
      JSON.stringify([...allDrafts, ...drafts])
    );
  }, [drafts, scriptId]);

  const addDraft = (sceneNumber: string | null, analysis: string) => {
    // Null guard with stable identifier
    const fallbackId = `unsaved-${hashString(analysis)}`;
    const finalSceneNumber = sceneNumber || fallbackId;

    // Prevent duplicates for null scenes
    if (!sceneNumber && drafts.some((d) => d.analysis === analysis)) return;

    setDrafts((current) => [
      ...current.filter((d) => d.sceneNumber !== finalSceneNumber),
      {
        scriptId,
        sceneNumber: finalSceneNumber,
        analysis,
        timestamp: Date.now(),
      },
    ]);
  };

  // Simple string hashing function
  const hashString = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i);
      hash |= 0; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(36);
  };

  const removeDraft = (sceneNumber: string | null) => {
    setDrafts((current) =>
      current.filter((d) => d.sceneNumber !== sceneNumber)
    );
  };

  const getDraft = (sceneNumber: string) => {
    return drafts.find((d) => d.sceneNumber === sceneNumber);
  };

  return {
    drafts,
    addDraft,
    removeDraft,
    getDraft,
  };
}
