"use client";

import { NavigationMenu } from "@/components/ui/navigation-menu";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Eye, Database } from "lucide-react";
import { ScriptDocument } from "@/hooks/useScripts";

export default function ScriptTopBar({
  toggleViewerScreen,
  script,
  toggleEntitiesScreen,
}: {
  toggleViewerScreen: () => void;
  script: ScriptDocument;
  toggleEntitiesScreen: () => void;
}) {
  return (
    <NavigationMenu className="sticky top-0 z-50 max-h-[4rem] w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 min-w-full">
      <ul className="h-14 px-4 md:px-6 flex items-center justify-between min-w-full">
        <div className="flex flex-col">
          <h1 className="text-lg font-semibold text-left">
            {script.name || "Untitled Script"}
          </h1>
          <p className="text-sm text-muted-foreground text-left">
            Uploaded: {new Date(script._creationTime).toLocaleString()}
          </p>
        </div>

        <div className="flex space-x-4">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" onClick={toggleEntitiesScreen}>
                <Database className="w-4 h-4" />
                <span className="ml-2">Entities</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <span>Open Saved Entities</span>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button onClick={toggleViewerScreen}>
                <Eye className="w-4 h-4" />
                <span className="ml-2">Viewer</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <span>Open Analysis Sheet</span>
            </TooltipContent>
          </Tooltip>
        </div>
      </ul>
    </NavigationMenu>
  );
}
