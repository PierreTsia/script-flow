import { Id } from "@/convex/_generated/dataModel";
import { useScene } from "@/hooks/useScene";
import { usePdfViewer } from "@/hooks/usePdfViewer";
import { useState, useCallback, useEffect } from "react";
import { FloatingTextSelectButton } from "./floating-text-select-button";
import SelectedTextDialog from "./selected-text-dialog";
import SceneAnalysisSheet from "./scene-analysis-sheet";

const ScriptViewerScreen = ({
  fileUrl,
  scriptId,
  isSheetOpen,
  setIsSheetOpen,
  children,
}: {
  fileUrl: string;
  scriptId: Id<"scripts">;
  isSheetOpen: boolean;
  setIsSheetOpen: (open: boolean) => void;
  children: React.ReactNode;
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectionRect, setSelectionRect] = useState<DOMRect | null>(null);
  const { isLoading, analyseAndSaveDraft } = useScene(scriptId);

  const {
    viewerRef,
    pdfSlickViewerRef,
    usePDFSlickStore,
    PDFSlickViewer,
    selectedText,
    selectedPages,
    setSelectedText,
  } = usePdfViewer(fileUrl);

  const handleAnalyze = useCallback(
    async (text: string, pageNumber: number) => {
      await analyseAndSaveDraft(text, pageNumber);
      setSelectedText(text);
      setIsDialogOpen(false);
    },
    [analyseAndSaveDraft, setSelectedText]
  );

  const handleOpenDialogChange = useCallback(
    (open: boolean) => {
      setIsDialogOpen(open);
      if (!open) setSelectedText("");
    },
    [setIsDialogOpen, setSelectedText]
  );

  const handleSheetOpenChange = useCallback(
    (open: boolean) => {
      setIsSheetOpen(open);
      if (!open) setSelectedText("");
    },
    [setIsSheetOpen, setSelectedText]
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
            onConfirmClick={() => handleAnalyze(selectedText, selectedPages[0])}
          />

          <SceneAnalysisSheet
            isOpen={isSheetOpen}
            selectedText={selectedText}
            selectedPage={selectedPages[0]}
            scriptId={scriptId}
            onOpenChange={handleSheetOpenChange}
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
      {children}
    </div>
  );
};

export default ScriptViewerScreen;
