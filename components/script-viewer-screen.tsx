import { Id } from "@/convex/_generated/dataModel";
import { DraftSceneAnalysis, useScene } from "@/hooks/useScene";
import { usePdfViewer } from "@/hooks/usePdfViewer";
import { useState, useCallback, useEffect } from "react";
import { FloatingTextSelectButton } from "./floating-text-select-button";
import SelectedTextDialog from "./selected-text-dialog";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import SceneAnalysisConfirmDialog from "./scene-analysis-confirm-dialog";

const ScriptViewerScreen = ({
  fileUrl,
  scriptId,
}: {
  fileUrl: string;
  scriptId: Id<"scripts">;
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectionRect, setSelectionRect] = useState<DOMRect | null>(null);
  const { isLoading, analyseAndSaveDraft } = useScene();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const pageParam = searchParams.get("page");
  const router = useRouter();

  const {
    viewerRef,
    pdfSlickViewerRef,
    usePDFSlickStore,
    PDFSlickViewer,
    selectedText,
    selectedPages,
    setSelectedText,
  } = usePdfViewer(fileUrl);

  const [lastAnalyzedText, setLastAnalyzedText] =
    useState<DraftSceneAnalysis | null>(null);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [selectionStartPage, setSelectionStartPage] = useState<number | null>(
    null
  );

  const clearClipboard = () => {
    window.getSelection()?.removeAllRanges();
  };

  const handleAnalyze = async (text: string, pageNumber: number) => {
    setSelectedText(text);
    const startPage = selectionStartPage ?? pageNumber;
    const draft = await analyseAndSaveDraft(text, startPage, scriptId);
    setLastAnalyzedText(draft);
    setIsDialogOpen(false);
    setIsConfirmDialogOpen(true);
    setSelectionStartPage(null);
    setSelectedText("");
    clearClipboard();
  };

  const handleOpenDialogChange = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      setSelectedText("");
      setSelectionStartPage(null);
      clearClipboard();
    }
  };

  const handleCancelDialog = () => {
    setIsDialogOpen(false);
    clearClipboard();
  };

  const pdfSlick = usePDFSlickStore((s) => s.pdfSlick);
  const pageNumber = usePDFSlickStore((s) => s.pageNumber);

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

  useEffect(() => {
    const handleMouseDown = () => {
      if (!window.getSelection()?.toString()) {
        // Only if no existing selection
        setSelectionStartPage(pageNumber);
      }
    };

    document.addEventListener("mousedown", handleMouseDown);
    return () => document.removeEventListener("mousedown", handleMouseDown);
  }, [pageNumber]);

  useEffect(() => {
    if (selectedText) {
      updateSelectionPosition();
    }
  }, [selectedText, updateSelectionPosition]);

  useEffect(() => {
    if (pageParam && pdfSlick && pageNumber) {
      const pageNumberParam = parseInt(pageParam, 10);
      if (!isNaN(pageNumberParam)) {
        pdfSlick.gotoPage(pageNumberParam);
        const params = new URLSearchParams(searchParams);
        router.replace(`${pathname}?${params.toString()}`);
      }
    }
  }, [pdfSlick, pageParam, router, pathname, searchParams, pageNumber]);

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
            onCancelClick={handleCancelDialog}
            selectedText={selectedText}
            selectedPage={selectionStartPage ?? pageNumber}
            isAnalyzing={isLoading}
            onConfirmClick={() => handleAnalyze(selectedText, selectedPages[0])}
          />

          {lastAnalyzedText && (
            <SceneAnalysisConfirmDialog
              selectedDraftAnalysis={lastAnalyzedText}
              isOpen={isConfirmDialogOpen}
              setIsOpen={() => setIsConfirmDialogOpen(false)}
            />
          )}
        </div>
      </div>

      {selectedText &&
        selectionRect &&
        !isDialogOpen &&
        !isConfirmDialogOpen && (
          <FloatingTextSelectButton
            selectionRect={selectionRect}
            onClick={() => {
              setIsDialogOpen(true);
            }}
          />
        )}
    </div>
  );
};

export default ScriptViewerScreen;
