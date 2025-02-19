"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { ScriptContent } from "@/components/script-content";
import {
  ScriptLoadingState,
  ScriptNotFound,
} from "@/components/client-page-wrapper";

interface Props {
  scriptId: Id<"scripts">;
}

const ScriptViewer = ({ scriptId }: Props) => {
  const scriptData = useQuery(api.scripts.getScript, { scriptId });

  if (!scriptData) {
    return <ScriptLoadingState />;
  }

  if (!scriptData?.data) {
    return <ScriptNotFound />;
  }

  return (
    <ScriptContent
      script={scriptData.data}
      fileUrl={scriptData.fileUrl || ""}
    />
  );
};

export default ScriptViewer;
