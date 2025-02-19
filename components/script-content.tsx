"use client";

import ScriptTopBar from "./script-top-bar";
import { ScriptDocument } from "@/hooks/useScripts";
import ScriptViewerScreen from "./script-viewer-screen";

interface ScriptContentProps {
  script: ScriptDocument;
  fileUrl: string;
}

export function ScriptContent({ script, fileUrl }: ScriptContentProps) {
  return (
    <div className="min-h-[100vh] flex flex-col">
      <ScriptTopBar
        scriptId={script._id}
        name={script.name}
        creationTime={script._creationTime}
      />

      <ScriptViewerScreen fileUrl={fileUrl} scriptId={script._id} />
    </div>
  );
}
