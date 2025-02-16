"use client";

import { Eye, Database } from "lucide-react";
import { ScriptDocument } from "@/hooks/useScripts";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
export default function ScriptTopBar({
  toggleEntitiesScreen,
  toggleViewerScreen,
  script,
}: {
  toggleEntitiesScreen: () => void;
  toggleViewerScreen: () => void;
  script: ScriptDocument;
}) {
  return (
    <ToggleGroup
      type="single"
      className="sticky top-0 z-50 max-h-[4rem] w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 min-w-full z-10"
    >
      <ul className="h-14 px-4 md:px-6 flex items-center justify-between min-w-full">
        <div className="flex flex-col">
          <h1 className="text-lg font-semibold text-left">
            {script.name || "Untitled Script"}
          </h1>
          <p className="text-sm text-muted-foreground text-left">
            Uploaded: {new Date(script._creationTime).toLocaleString()}
          </p>
        </div>

        <div className="flex items-center gap-2 w-[200px]">
          <ToggleGroupItem value="entities" onClick={toggleEntitiesScreen}>
            <Database className="w-4 h-4" />
            <span className="ml-2">Entities</span>
          </ToggleGroupItem>

          <ToggleGroupItem value="viewer" onClick={toggleViewerScreen}>
            <Eye className="w-4 h-4" />
            <span className="ml-2">Viewer</span>
          </ToggleGroupItem>
        </div>
      </ul>
    </ToggleGroup>
  );
}
