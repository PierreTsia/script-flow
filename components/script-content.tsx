"use client";

import { useState } from "react";
import ScriptTopBar from "./script-top-bar";
import { ScriptDocument } from "@/hooks/useScripts";
import ScriptViewerScreen from "./script-viewer-screen";
import { Button } from "./ui/button";
import { Brain } from "lucide-react";

interface ScriptContentProps {
  script: ScriptDocument;
  fileUrl: string;
}

export function ScriptContent({ script, fileUrl }: ScriptContentProps) {
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const [activeScreen, setActiveScreen] = useState<"viewer" | "entities">(
    "viewer"
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
          <Button
            onClick={toggleSheet}
            className="absolute w-[80vw] left-1/2 -translate-x-1/2 top-[91vh]"
          >
            <Brain className="w-4 h-4" />
            <span className="ml-2">Open Analysis Panel</span>
          </Button>
        </ScriptViewerScreen>
      )}
    </div>
  );
}
