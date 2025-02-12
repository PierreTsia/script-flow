"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useState, useEffect } from "react";
import ScriptTopBar from "./script-top-bar";
import { ScriptDocument } from "@/hooks/useScripts";

import { Button } from "@/components/ui/button";
import { useScene } from "@/hooks/useScene";
import { usePdfViewer } from "@/hooks/usePdfViewer";

interface ScriptContentProps {
  script: ScriptDocument;
  fileUrl: string;
}

export function ScriptContent({ script, fileUrl }: ScriptContentProps) {
  const { analyze } = useScene();
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

  useEffect(() => {
    console.log("selectedText in content", selectedText);
    if (selectedText && !isSheetOpen) {
      setIsSheetOpen(true);
    }
  }, [selectedText, isSheetOpen]);

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

            <Sheet
              open={isSheetOpen}
              onOpenChange={(open) => {
                setIsSheetOpen(open);
                if (!open) setSelectedText("");
              }}
            >
              <SheetTrigger asChild className="hidden">
                <button className="hidden" aria-hidden="true" />
              </SheetTrigger>
              <SheetContent side="bottom" className="h-[60vh]">
                <SheetHeader>
                  <SheetTitle>Scene Management</SheetTitle>
                  <SheetDescription>
                    Manage your script scenes here
                  </SheetDescription>{" "}
                </SheetHeader>

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
