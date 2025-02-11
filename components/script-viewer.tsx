"use client";

import { useAuth } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Spinner } from "@/components/ui/spinner";
import { ScriptContent } from "@/components/script-content";

interface Props {
  scriptId: Id<"scripts">;
}

export default function ScriptViewer({ scriptId }: Props) {
  const { isLoaded: authLoaded } = useAuth();
  const scriptData = useQuery(api.scripts.getScript, { scriptId });

  if (!authLoaded || scriptData === undefined) {
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
}

function ScriptLoadingState() {
  return (
    <div className="flex h-full items-center justify-center w-full mt-12">
      <Spinner show={true} size="large" />
    </div>
  );
}

function ScriptNotFound() {
  return (
    <div className="flex h-full items-center justify-center text-destructive">
      Script not found
    </div>
  );
}
