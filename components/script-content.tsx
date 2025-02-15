"use client";

import { useCallback, useState, useEffect } from "react";
import ScriptTopBar from "./script-top-bar";
import { ScriptDocument } from "@/hooks/useScripts";
import { useScene } from "@/hooks/useScene";
import { usePdfViewer } from "@/hooks/usePdfViewer";
import SceneAnalysisSheet from "./scene-analysis-sheet";

import SelectedTextDialog from "./selected-text-dialog";
import { FloatingTextSelectButton } from "./floating-text-select-button";

interface ScriptContentProps {
  script: ScriptDocument;
  fileUrl: string;
}

export function ScriptContent({ script, fileUrl }: ScriptContentProps) {
  const { isLoading, analyseAndSaveDraft } = useScene(script._id);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectionRect, setSelectionRect] = useState<DOMRect | null>(null);

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

  const updateSelectionPosition = useCallback(() => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(selection.rangeCount - 1);
      const rect = range.getBoundingClientRect();

      // Only update if we have valid dimensions
      if (rect.width > 0 && rect.height > 0) {
        setSelectionRect(rect);
      }
    }
  }, []);

  // Add effect to update position when text is selected
  useEffect(() => {
    if (selectedText) {
      updateSelectionPosition();
    }
  }, [selectedText, updateSelectionPosition]);

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
              isAnalyzing={isLoading}
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
              isAnalyzing={isLoading}
            />
          </div>
        </div>

        {selectedText && selectionRect && !isDialogOpen && !isSheetOpen && (
          <FloatingTextSelectButton
            selectionRect={selectionRect}
            onClick={() => {
              setIsDialogOpen(true);
            }}
          />
        )}
      </div>
    </div>
  );
}
