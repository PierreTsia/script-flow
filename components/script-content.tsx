"use client";

import type { DataModel } from "@/convex/_generated/dataModel";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { PanelLeftOpen } from "lucide-react";
import { useState } from "react";
import ScriptTopBar from "./script-top-bar";
import { ScriptDocument } from "@/hooks/useScripts";

interface ScriptContentProps {
  script: ScriptDocument;
  fileUrl: string;
}

export function ScriptContent({ script, fileUrl }: ScriptContentProps) {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const toggleSidebar = () => {
    setIsSheetOpen((prev) => !prev);
  };

  return (
    <div className="min-h-[100vh] flex flex-col">
      <ScriptTopBar toggleSidebar={toggleSidebar} script={script} />
      <div className="flex flex-col w-full bg-background flex-1">
        {/* Main Content Area */}
        <div className="flex flex-1 overflow-hidden">
          {/* PDF Viewer - 70% width on desktop */}
          <div className="h-full w-full ">
            {fileUrl && (
              <iframe
                src={fileUrl}
                className="h-full w-full border-none min-h-[30vh]"
              />
            )}
          </div>

          {/* Desktop Scenes Sidebar - Regular div */}
          <div className="hidden lg:block lg:min-w-[40%] xl:min-w-[50%] h-full border-l">
            <div className="h-full flex flex-col">
              <div className="p-4 border-b">
                <h2 className="text-lg font-semibold">Scenes</h2>
              </div>
              <div className="flex-1 overflow-y-auto p-4">
                <div className="text-muted-foreground">
                  Select text in the PDF to create scenes
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Sheet */}
          <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetTrigger asChild className="lg:hidden">
              <button className="hidden" aria-hidden="true" />
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[40vh]">
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
