import { useCallback, useEffect } from "react";
import "@pdfslick/react/dist/pdf_viewer.css";

import { usePDFSlick } from "@pdfslick/react";
import { useRef, useState } from "react";

export const usePdfViewer = (fileUrl: string) => {
  const [selectedText, setSelectedText] = useState("");
  const [selectedPages, setSelectedPages] = useState<number[]>([]);

  const viewerRef = useRef<HTMLDivElement>(null);
  const {
    viewerRef: pdfSlickViewerRef,
    usePDFSlickStore,
    PDFSlickViewer,
  } = usePDFSlick(fileUrl, {
    scaleValue: "page-fit",
    textLayerMode: 1,
    useOnlyCssZoom: true,
    removePageBorders: true,
  });
  const pdfSlick = usePDFSlickStore((state) => state.pdfSlick);

  const handleSelection = useCallback(() => {
    const selection = window.getSelection();

    if (!selection || !viewerRef.current || !pdfSlick) return;

    const isInViewer = viewerRef.current.contains(selection.anchorNode);
    const text = selection.toString().trim();

    if (isInViewer && text) {
      const currentPage = pdfSlick.store.getState().pageNumber;
      setSelectedPages([currentPage]);
      setSelectedText(text);
    } else {
      setSelectedText("");
      setSelectedPages([]);
    }
  }, [pdfSlick]);

  useEffect(() => {
    const viewer = viewerRef.current;

    viewer?.addEventListener("mouseup", handleSelection);
    viewer?.addEventListener("touchend", handleSelection);

    return () => {
      viewer?.removeEventListener("mouseup", handleSelection);
      viewer?.removeEventListener("touchend", handleSelection);
    };
  }, [viewerRef, handleSelection]);

  return {
    viewerRef,
    pdfSlickViewerRef,
    handleSelection,
    selectedText,
    selectedPages,
    PDFSlickViewer,
    usePDFSlickStore,
    setSelectedText,
  };
};
