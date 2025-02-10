"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { UploadCloud, FileText, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatFileSize } from "@/lib/files";
import { useTranslations } from "next-intl";

interface FileDropZoneProps {
  onFileAccepted: (file: File) => Promise<void>;
}

export function FileDropZone({ onFileAccepted }: FileDropZoneProps) {
  const t = useTranslations("Scripts");
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const onDrop = useCallback(
    (droppedFiles: File[]) => {
      if (droppedFiles.length > 0) {
        setFile(droppedFiles[0]);
      }
    },
    [setFile]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
    },
    multiple: false,
  });

  return (
    <>
      {file ? (
        <div className="flex flex-col items-center justify-center gap-4 p-6">
          <FileText className="h-16 w-16 text-primary" />
          <div className="text-center">
            <p className="font-medium">{file.name}</p>
            <p className="text-sm text-muted-foreground">
              {formatFileSize(file.size)}
            </p>
          </div>
          <Button
            onClick={async () => {
              setIsUploading(true);
              await onFileAccepted(file);
              setFile(null);
              setIsUploading(false);
            }}
            className="gap-2"
          >
            {isUploading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Check className="h-4 w-4" />
            )}
            {isUploading ? t("dropzone.uploading") : t("dropzone.confirm")}
          </Button>
        </div>
      ) : (
        <div
          {...getRootProps()}
          className={`h-full w-full p-4 flex flex-col items-center justify-center cursor-pointer transition-colors ${
            isDragActive
              ? "  bg-primary/10"
              : "hover:border-muted-foreground/50"
          }`}
        >
          <input {...getInputProps()} />
          <UploadCloud
            className={`h-12 w-12 mb-4 ${
              isDragActive ? "text-primary" : "text-muted-foreground"
            }`}
          />
          <p className="text-center text-muted-foreground">
            {isDragActive ? t("dropzone.dropPrompt") : t("dropzone.dragPrompt")}
          </p>
        </div>
      )}
    </>
  );
}
