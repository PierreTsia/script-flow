"use client";

import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useState, useRef } from "react";
import ScriptTopBar from "./script-top-bar";
import { ScriptDocument } from "@/hooks/useScripts";
import { usePDFSlick } from "@pdfslick/react";
import "@pdfslick/react/dist/pdf_viewer.css";
import type { PDFSlick } from "@pdfslick/core";

interface ScriptContentProps {
  script: ScriptDocument;
  fileUrl: string;
}

export function ScriptContent({ script, fileUrl }: ScriptContentProps) {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const toggleSidebar = () => {
    setIsSheetOpen((prev) => !prev);
  };

  const containerRef = useRef<HTMLDivElement>(null);
  const { viewerRef, usePDFSlickStore, PDFSlickViewer } = usePDFSlick(fileUrl, {
    scaleValue: "page-fit",
    textLayerMode: 1,
    useOnlyCssZoom: true,
    removePageBorders: true,
  });

  return (
    <div className="min-h-[100vh] flex flex-col">
      <ScriptTopBar toggleSidebar={toggleSidebar} script={script} />
      <div className="flex flex-col w-full bg-background flex-1">
        {/* Main Content Area */}
        <div className="flex flex-1 overflow-hidden">
          <div className="h-full w-full">
            <PDFSlickViewer {...{ viewerRef, usePDFSlickStore }} />
          </div>

          {/* Sheet */}
          <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetTrigger asChild className="hidden">
              <button className="hidden" aria-hidden="true" />
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[60vh]">
              <SheetTitle>Scene Management</SheetTitle>
              <SheetDescription>
                Manage your script scenes here
              </SheetDescription>
              <div className="h-full flex flex-col">
                <div className="flex-1 overflow-y-auto p-4">
                  <div className="text-muted-foreground">
                    Select text in the PDF to create scenes
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </div>
  );
}
