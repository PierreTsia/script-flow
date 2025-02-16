"use client";

import { useState } from "react";
import ScriptTopBar from "./script-top-bar";
import { ScriptDocument } from "@/hooks/useScripts";
import ScriptViewerScreen from "./script-viewer-screen";
import { Button } from "./ui/button";
import { Brain } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";

import ScriptSceneEntitiesScreen from "./script-entities-screen/script-scene-entities-screen";
interface ScriptContentProps {
  script: ScriptDocument;
  fileUrl: string;
}

export function ScriptContent({ script, fileUrl }: ScriptContentProps) {
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const [activeScreen, setActiveScreen] = useState<"viewer" | "entities">(
    "entities"
  );

  const toggleSheet = () => {
    setIsSheetOpen((prev) => !prev);
  };

  return (
    <div className="min-h-[100vh] flex flex-col">
      <ScriptTopBar
        toggleViewerScreen={() => setActiveScreen("viewer")}
        script={script}
        toggleEntitiesScreen={() => setActiveScreen("entities")}
      />
      {activeScreen === "viewer" && (
        <ScriptViewerScreen
          fileUrl={fileUrl}
          scriptId={script._id}
          isSheetOpen={isSheetOpen}
          setIsSheetOpen={setIsSheetOpen}
        >
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={toggleSheet}
                  className="absolute w-[80px] h-[80px] left-1/2 -translate-x-1/2 top-[80vh] lg:top-[90vh] rounded-full flex items-center justify-center flex-col opacity-50 hover:opacity-100 transition-opacity duration-300"
                >
                  <Brain className="!w-[2rem] !h-[2rem]" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Open Analysis Panel</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </ScriptViewerScreen>
      )}
      {activeScreen === "entities" && (
        <ScriptSceneEntitiesScreen scriptId={script._id} />
      )}
    </div>
  );
}
