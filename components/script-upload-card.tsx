"use client";

import { FileDropZone } from "@/components/file-drop-zone";
import { useScripts } from "@/hooks/useScripts";
export function ScriptUploadCard() {
  const { uploadScript } = useScripts();

  const handleFileAccepted = (file: File) => {
    // TODO add try catch and a toast feedback
    uploadScript(file);
  };

  return (
    <div className="border-2 border-dashed rounded-xl p-8 text-center">
      <h2 className="text-xl font-semibold mb-4">Upload Script</h2>
      <div className="h-64 bg-muted/50 rounded-lg flex items-center justify-center">
        <FileDropZone onFileAccepted={handleFileAccepted} />
      </div>
    </div>
  );
}
