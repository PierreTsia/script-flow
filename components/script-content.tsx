"use client";

import { useCallback, useState, useRef, useEffect, useMemo } from "react";
import ScriptTopBar from "./script-top-bar";
import { ScriptDocument } from "@/hooks/useScripts";
import { SceneAnalysis } from "@/lib/llm/providers/index";
import { useScene } from "@/hooks/useScene";
import { usePdfViewer } from "@/hooks/usePdfViewer";
import SceneAnalysisSheet from "./scene-analysis-sheet";

interface ScriptContentProps {
  script: ScriptDocument;
  fileUrl: string;
}

export function ScriptContent({ script, fileUrl }: ScriptContentProps) {
  const { analyze, isAnalyzing, error } = useScene();
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const [sceneAnalysis, setSceneAnalysis] = useState<SceneAnalysis | null>(
    null
  );

  const prevAnalysis = useRef<SceneAnalysis | null>(null);

  const stabilizeAnalysis = (analysis: SceneAnalysis | null) => {
    if (!analysis) return null;

    if (
      prevAnalysis.current?.scene_number === analysis.scene_number &&
      prevAnalysis.current?.pageNumber === analysis.pageNumber &&
      JSON.stringify(prevAnalysis.current?.characters) ===
        JSON.stringify(analysis.characters) &&
      JSON.stringify(prevAnalysis.current?.locations) ===
        JSON.stringify(analysis.locations)
    ) {
      return prevAnalysis.current;
    }

    prevAnalysis.current = analysis;
    return analysis;
  };

  const handleAnalyze = useCallback(
    async (text: string, pageNumber: number) => {
      const rawAnalysis = await analyze(text, pageNumber);
      const stableAnalysis = stabilizeAnalysis(rawAnalysis);
      setSceneAnalysis(stableAnalysis);
    },
    [analyze]
  );

  const {
    viewerRef,
    pdfSlickViewerRef,
    usePDFSlickStore,
    PDFSlickViewer,
    selectedText,
    selectedPages,
    setSelectedText,
  } = usePdfViewer(fileUrl);

  const toggleSidebar = () => {
    setIsSheetOpen((prev) => !prev);
  };

  const handleOpenChange = useCallback(
    (open: boolean) => {
      setIsSheetOpen(open);
      if (!open) setSelectedText("");
    },
    [setIsSheetOpen, setSelectedText]
  );

  return (
    <div className="min-h-[100vh] flex flex-col">
      {/* TODO later on, the topbar could store selected extracts 
      saved in storage and open the sheet on select one */}
      <ScriptTopBar toggleSidebar={toggleSidebar} script={script} />
      <div className="flex flex-col w-full bg-background flex-1">
        <div className="flex flex-1 overflow-hidden">
          <div className="h-full w-full">
            <div ref={viewerRef} className="h-full w-full">
              <PDFSlickViewer
                {...{ viewerRef: pdfSlickViewerRef, usePDFSlickStore }}
              />
            </div>

            <SceneAnalysisSheet
              isOpen={isSheetOpen}
              selectedText={selectedText}
              selectedPage={selectedPages[0]}
              scriptId={script._id}
              onOpenChange={handleOpenChange}
              onAnalyze={() => handleAnalyze(selectedText, selectedPages[0])}
              isAnalyzing={isAnalyzing}
              sceneAnalysis={sceneAnalysis}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
