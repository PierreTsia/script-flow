"use client";

import { FileDropZone } from "@/components/file-drop-zone";
import { toast } from "@/hooks/use-toast";
import { useScripts } from "@/hooks/useScripts";
import { useTranslations } from "next-intl";

export function ScriptUploadCard() {
  const { uploadScript } = useScripts();
  const t = useTranslations("Scripts");

  const handleFileAccepted = async (file: File) => {
    // TODO add try catch and a toast feedback
    try {
      await uploadScript(file);
      toast({
        title: t("uploadSuccess"),
      });
    } catch (error) {
      console.error(error);
      toast({
        title: t("uploadError"),
        variant: "destructive",
      });
    }
  };

  return (
    <div className="border-2 border-dashed rounded-xl p-8 text-center">
      <h2 className="text-xl font-semibold mb-4">{t("upload")}</h2>
      <div className="h-64 bg-muted/50 rounded-lg flex items-center justify-center">
        <FileDropZone onFileAccepted={handleFileAccepted} />
      </div>
    </div>
  );
}
