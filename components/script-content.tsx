"use client";

import { useCallback, useState } from "react";
import ScriptTopBar from "./script-top-bar";
import { ScriptDocument } from "@/hooks/useScripts";
import { useScene } from "@/hooks/useScene";
import { usePdfViewer } from "@/hooks/usePdfViewer";
import SceneAnalysisSheet from "./scene-analysis-sheet";

import { Button } from "./ui/button";
import { Wand2 } from "lucide-react";
import SelectedTextDialog from "./selected-text-dialog";
interface ScriptContentProps {
  script: ScriptDocument;
  fileUrl: string;
}

export function ScriptContent({ script, fileUrl }: ScriptContentProps) {
  const { isAnalyzing, analyseAndSaveDraft } = useScene(script._id);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const [isDialogOpen, setIsDialogOpen] = useState(false);

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

  const handleOpenDialogChange = useCallback(
    (open: boolean) => {
      setIsDialogOpen(open);
      if (!open) setSelectedText("");
    },
    [setIsDialogOpen, setSelectedText]
  );

  const handleAnalyze = useCallback(
    async (text: string, pageNumber: number) => {
      await analyseAndSaveDraft(text, pageNumber);
      setSelectedText(text);
      setIsDialogOpen(false);
    },
    [analyseAndSaveDraft, setSelectedText]
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

            <SelectedTextDialog
              isDialogOpen={isDialogOpen}
              onOpenChange={handleOpenDialogChange}
              selectedText={selectedText}
              selectedPage={selectedPages[0]}
              isAnalyzing={isAnalyzing}
              onConfirmClick={() =>
                handleAnalyze(selectedText, selectedPages[0])
              }
            />

            <SceneAnalysisSheet
              isOpen={isSheetOpen}
              selectedText={selectedText}
              selectedPage={selectedPages[0]}
              scriptId={script._id}
              onOpenChange={handleOpenChange}
              onAnalyze={() => handleAnalyze(selectedText, selectedPages[0])}
              isAnalyzing={isAnalyzing}
            />
          </div>
        </div>

        {selectedText && (
          <div className="fixed bottom-4 left-4 z-50 animate-in fade-in slide-in-from-bottom-2">
            <Button
              onClick={() => setIsDialogOpen(true)}
              className="rounded-full shadow-lg px-6 py-6 gap-2"
            >
              <Wand2 className="h-5 w-5" />
              <span>Analyze Scene</span>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
