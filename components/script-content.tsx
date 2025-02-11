"use client";

import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useState, useRef, useEffect } from "react";
import ScriptTopBar from "./script-top-bar";
import { ScriptDocument } from "@/hooks/useScripts";
import { usePDFSlick } from "@pdfslick/react";
import "@pdfslick/react/dist/pdf_viewer.css";
import type { PDFSlick } from "@pdfslick/core";
import { Button } from "@/components/ui/button";

interface ScriptContentProps {
  script: ScriptDocument;
  fileUrl: string;
}

export function ScriptContent({ script, fileUrl }: ScriptContentProps) {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [selectedText, setSelectedText] = useState("");
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

  // Handle text selection
  useEffect(() => {
    const handleSelection = () => {
      const selection = window.getSelection();
      if (!selection || !viewerRef.current) return;

      // Verify selection is within PDF viewer
      const isInViewer = viewerRef.current.contains(selection.anchorNode);
      const text = selection.toString().trim();

      setSelectedText(isInViewer ? text : "");
      setIsSheetOpen(!!text);
    };

    const viewer = viewerRef.current;
    viewer?.addEventListener("mouseup", handleSelection);

    return () => {
      viewer?.removeEventListener("mouseup", handleSelection);
    };
  }, [viewerRef]);

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
                  <div className=" overflow-y-auto p-4">
                    <div className="text-muted-foreground">{selectedText}</div>
                  </div>
                  {selectedText && (
                    <div className="p-4 mt-12">
                      <Button
                        className=""
                        onClick={() => {
                          /* TODO: Add handler */
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

          {selectedText && (
            <div className="absolute bottom-4 right-4 bg-background p-4 rounded-lg shadow-lg">
              Selected: {selectedText}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
