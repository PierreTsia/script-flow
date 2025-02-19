"use client";
import { useAuth } from "@clerk/nextjs";
import { Spinner } from "./ui/spinner";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { Id } from "@/convex/_generated/dataModel";

export const ClientPageWrapper = ({
  children,
  scriptId,
}: {
  children: React.ReactNode;
  scriptId: Id<"scripts">;
}) => {
  const { isLoaded: authLoaded } = useAuth();
  if (!authLoaded) {
    return <ScriptLoadingState />;
  }
  if (!scriptId) {
    return <ScriptNotFound />;
  }
  return <>{children}</>;
};

export const ScriptLoadingState = () => {
  return (
    <div className="flex h-full items-center justify-center w-full mt-12">
      <Spinner show={true} size="large" />
    </div>
  );
};

export const ScriptNotFound = () => {
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
};
