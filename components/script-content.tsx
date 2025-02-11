"use client";

import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useState, useRef, useEffect, useCallback } from "react";
import ScriptTopBar from "./script-top-bar";
import { ScriptDocument } from "@/hooks/useScripts";
import { usePDFSlick } from "@pdfslick/react";
import "@pdfslick/react/dist/pdf_viewer.css";
import { Button } from "@/components/ui/button";
import { useScene } from "@/hooks/useScene";
interface ScriptContentProps {
  script: ScriptDocument;
  fileUrl: string;
}

export function ScriptContent({ script, fileUrl }: ScriptContentProps) {
  const { analyze } = useScene();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [selectedText, setSelectedText] = useState("");
  const [selectedPages, setSelectedPages] = useState<number[]>([]);
  const toggleSidebar = () => {
    setIsSheetOpen((prev) => !prev);
  };

  const viewerRef = useRef<HTMLDivElement>(null);
  const {
    viewerRef: pdfSlickViewerRef,
    usePDFSlickStore,
    PDFSlickViewer,
  } = usePDFSlick(fileUrl, {
    scaleValue: "page-fit",
    textLayerMode: 1,
    useOnlyCssZoom: true,
    removePageBorders: true,
  });

  const pdfSlick = usePDFSlickStore((state) => state.pdfSlick);

  const handleSelection = useCallback(() => {
    const selection = window.getSelection();
    if (!selection || !viewerRef.current || !pdfSlick) return;

    const isInViewer = viewerRef.current.contains(selection.anchorNode);
    const text = selection.toString().trim();

    if (isInViewer && text) {
      const currentPage = pdfSlick.store.getState().pageNumber;
      setSelectedPages([currentPage]);
      setSelectedText(text);
      setIsSheetOpen(true);
    } else {
      setSelectedText("");
      setSelectedPages([]);
    }
  }, [pdfSlick]);

  useEffect(() => {
    const viewer = viewerRef.current;
    const selectionHandler = () => handleSelection();

    viewer?.addEventListener("mouseup", selectionHandler);
    return () => {
      viewer?.removeEventListener("mouseup", selectionHandler);
    };
  }, [viewerRef, handleSelection]);

  return (
    <div className="min-h-[100vh] flex flex-col">
      <ScriptTopBar toggleSidebar={toggleSidebar} script={script} />
      <div className="flex flex-col w-full bg-background flex-1">
        {/* Main Content Area */}
        <div className="flex flex-1 overflow-hidden">
          <div className="h-full w-full">
            <div ref={viewerRef} className="h-full w-full">
              <PDFSlickViewer
                {...{ viewerRef: pdfSlickViewerRef, usePDFSlickStore }}
              />
            </div>

            {/* Sheet */}
            <Sheet
              open={isSheetOpen}
              onOpenChange={(open) => {
                if (!open) setSelectedText(""); // Clear selection on close
                setIsSheetOpen(open);
              }}
            >
              <SheetTrigger asChild className="hidden">
                <button className="hidden" aria-hidden="true" />
              </SheetTrigger>
              <SheetContent side="bottom" className="h-[60vh]">
                <SheetTitle>Scene Management</SheetTitle>
                <SheetDescription>
                  Manage your script scenes here
                </SheetDescription>
                <div className="h-full flex flex-col">
                  {selectedPages.length > 0 && (
                    <div className="text-sm mt-2 text-muted-foreground/70">
                      Selected on page: {selectedPages[0]}
                    </div>
                  )}

                  {selectedText && (
                    <div className="p-4 ">
                      <div className="text-muted-foreground bg-foreground/10 p-4 rounded-lg">
                        {selectedText}
                      </div>
                      <Button
                        className="mt-4"
                        onClick={() => {
                          analyze(selectedText, selectedPages[0]);
                        }}
                      >
                        🤖 Analyze Selection
                      </Button>
                    </div>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </div>
  );
}
