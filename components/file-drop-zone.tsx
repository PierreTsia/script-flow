"use client";

import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { UploadCloud } from "lucide-react";

interface FileDropZoneProps {
  onFileAccepted: (file: File) => void;
}

export function FileDropZone({ onFileAccepted }: FileDropZoneProps) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        onFileAccepted(acceptedFiles[0]);
      }
    },
    [onFileAccepted]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
    },
    multiple: false,
  });

  return (
    <div
      {...getRootProps()}
      className={`h-full w-full p-4 flex flex-col items-center justify-center cursor-pointer transition-colors ${
        isDragActive ? "  bg-primary/10" : "hover:border-muted-foreground/50"
      }`}
    >
      <input {...getInputProps()} />
      <UploadCloud
        className={`h-12 w-12 mb-4 ${
          isDragActive ? "text-primary" : "text-muted-foreground"
        }`}
      />
      <p className="text-center text-muted-foreground">
        {isDragActive
          ? "Drop the PDF here"
          : "Drag & drop script PDF, or click to select"}
      </p>
    </div>
  );
}
