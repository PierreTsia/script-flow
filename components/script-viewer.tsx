"use client";

import { useAuth } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Spinner } from "@/components/ui/spinner";
import { ScriptContent } from "@/components/script-content";
import { useTranslations } from "next-intl";
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
  const t = useTranslations("Scripts.notFound");

  return (
    <div className="flex flex-col h-full items-center justify-center gap-4 p-8 text-center w-full mt-12">
      {/* Light mode image */}
      <img
        src="/assets/no-script-found-light.svg"
        className="w-[200px] opacity-75 dark:hidden"
        aria-hidden="true"
        alt=""
      />
      {/* Dark mode image */}
      <img
        src="/assets/no-script-found-dark.svg"
        className="w-[200px] hidden dark:block opacity-65"
        aria-hidden="true"
        alt=""
      />
      <div className="space-y-2">
        <h3 className="text-lg font-medium text-foreground">{t("title")}</h3>
        <p className="text-sm text-muted-foreground">{t("description")}</p>
      </div>
    </div>
  );
}
