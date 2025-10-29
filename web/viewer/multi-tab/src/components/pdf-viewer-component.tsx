/// <reference types="vite/client" />

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";

type NutrientViewerInstance = Awaited<ReturnType<typeof NutrientViewer.load>>;

async function toBase64(blob: Blob): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve((reader.result as string).split(",")[1]);
    reader.readAsDataURL(blob);
  });
}

function b64toBlob(
  b64Data: string,
  contentType = "application/pdf",
  sliceSize = 512
): Blob {
  const byteChars = atob(b64Data);
  const byteArrays: BlobPart[] = [];
  for (let offset = 0; offset < byteChars.length; offset += sliceSize) {
    const slice = byteChars.slice(offset, offset + sliceSize);
    const bytes = new Uint8Array(slice.length);
    for (let i = 0; i < slice.length; i++) {
      bytes[i] = slice.charCodeAt(i);
    }
    byteArrays.push(bytes);
  }
  return new Blob(byteArrays, { type: contentType });
}

interface PdfViewerComponentProps {
  id: string;
  document: string;
}

export interface PdfViewerComponentRef {
  exportPdf: () => Promise<string | null>;
}

const PdfViewerComponent = forwardRef<
  PdfViewerComponentRef,
  PdfViewerComponentProps
>(({ id, document }, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const instanceRef = useRef<NutrientViewerInstance | null>(null);
  const [loadUrl, setLoadUrl] = useState<string | null>(null);

  useImperativeHandle(ref, () => ({
    exportPdf: async () => {
      if (!instanceRef.current) return null;
      const arrayBuffer = await instanceRef.current.exportPDF();
      const blob = new Blob([arrayBuffer], { type: "application/pdf" });
      return toBase64(blob);
    },
  }));

  useEffect(() => {
    const key = `pdf-${id}`;
    const stored = localStorage.getItem(key);
    if (stored) {
      const blob = b64toBlob(stored);
      setLoadUrl(URL.createObjectURL(blob));
    } else {
      setLoadUrl(document);
    }
  }, [id, document]);

  useEffect(() => {
    if (!loadUrl || !containerRef.current) return;

    const { NutrientViewer } = window;
    if (!NutrientViewer) {
      console.error("Nutrient Viewer is not loaded.");
      return;
    }

    let instance: NutrientViewerInstance | null = null;

    const loadPDF = async () => {
      try {
        if (instanceRef.current) {
          NutrientViewer.unload(instanceRef.current);
          instanceRef.current = null;
        }

        const key = `pdf-${id}`;

        instance = await NutrientViewer.load({
          container: containerRef.current,
          document: loadUrl,
          licenseKey: import.meta.env.VITE_lkey,
        });

        instanceRef.current = instance;

        const saveChanges = async () => {
          if (!instanceRef.current) return;
          try {
            const arrayBuffer = await instanceRef.current.exportPDF();
            const blob = new Blob([arrayBuffer], { type: "application/pdf" });
            const base64 = await toBase64(blob);
            localStorage.setItem(key, base64);
          } catch (error) {
            console.error("Error saving changes:", error);
          }
        };

        instance.addEventListener("annotations.create", saveChanges);
        instance.addEventListener("annotations.delete", saveChanges);
        instance.addEventListener("annotations.update", saveChanges);
        instance.addEventListener("document.change", saveChanges);
        instance.addEventListener("formFieldValues.update", saveChanges);
      } catch (error) {
        console.error("Error loading NutrientViewer:", error);
      }
    };

    loadPDF();

    return () => {
      if (instanceRef.current && NutrientViewer) {
        NutrientViewer.unload(instanceRef.current);
        instanceRef.current = null;
      }
    };
  }, [loadUrl, id]);

  return (
    <div
      ref={containerRef}
      style={{
        width: "100%",
        height: "100%",
      }}
    />
  );
});

PdfViewerComponent.displayName = "PdfViewerComponent";

export default PdfViewerComponent;
