"use client";

import { useAuth } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Spinner } from "@/components/ui/spinner";
import { ScriptContent } from "@/components/script-content";
import { useTranslations } from "next-intl";
import Image from "next/image";

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
      <div className="relative w-[200px] h-[195px] opacity-75 dark:hidden">
        <Image
          src="/assets/no-script-found-light.svg"
          alt=""
          fill
          priority
          className="object-contain"
          aria-hidden="true"
        />
      </div>

      {/* Dark mode image */}
      <div className="relative w-[200px] h-[195px] hidden dark:block opacity-25">
        <Image
          src="/assets/no-script-found-dark.svg"
          alt=""
          fill
          priority
          className="object-contain"
          aria-hidden="true"
        />
      </div>

      <div className="space-y-2">
        <h3 className="text-lg font-medium text-foreground">{t("title")}</h3>
        <p className="text-sm text-muted-foreground">{t("description")}</p>
      </div>
    </div>
  );
}
