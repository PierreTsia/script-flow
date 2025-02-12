"use client";

import { useState } from "react";
import ScriptTopBar from "./script-top-bar";
import { ScriptDocument } from "@/hooks/useScripts";

import { useScene } from "@/hooks/useScene";
import { usePdfViewer } from "@/hooks/usePdfViewer";
import SceneAnalysisSheet from "./scene-analysis-sheet";

interface ScriptContentProps {
  script: ScriptDocument;
  fileUrl: string;
}

export function ScriptContent({ script, fileUrl }: ScriptContentProps) {
  const { analyze, isAnalyzing } = useScene();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
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

  const handleOpenChange = (open: boolean) => {
    setIsSheetOpen(open);
    if (!open) setSelectedText("");
  };

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
              onOpenChange={handleOpenChange}
              onAnalyze={() => analyze(selectedText, selectedPages[0])}
              isAnalyzing={isAnalyzing}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
