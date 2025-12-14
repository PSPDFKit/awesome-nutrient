import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";

async function toBase64(blob) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result.split(",")[1]);
    reader.readAsDataURL(blob);
  });
}

function b64toBlob(b64Data, contentType = "application/pdf", sliceSize = 512) {
  const byteChars = atob(b64Data);
  const byteArrays = [];
  for (let offset = 0; offset < byteChars.length; offset += sliceSize) {
    const slice = byteChars.slice(offset, offset + sliceSize);
    const bytes = new Array(slice.length);
    for (let i = 0; i < slice.length; i++) {
      bytes[i] = slice.charCodeAt(i);
    }
    byteArrays.push(new Uint8Array(bytes));
  }
  return new Blob(byteArrays, { type: contentType });
}

const PdfViewerComponent = forwardRef(({ id, document }, ref) => {
  const containerRef = useRef(null);
  const instanceRef = useRef(null);
  const [loadUrl, setLoadUrl] = useState(null);

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

    let instance = null;
    let cancelled = false;

    const loadPDF = async () => {
      // Wait for container to have dimensions (handles display:none -> display:block transition)
      const waitForDimensions = () => new Promise((resolve) => {
        const check = () => {
          if (cancelled) return;
          const rect = containerRef.current?.getBoundingClientRect();
          if (rect && rect.width > 0 && rect.height > 0) {
            resolve();
          } else {
            requestAnimationFrame(check);
          }
        };
        check();
      });
      
      await waitForDimensions();
      if (cancelled) return;
      try {
        if (instanceRef.current) {
          NutrientViewer.unload(instanceRef.current);
          instanceRef.current = null;
        }

        const key = `pdf-${id}`;

        instance = await NutrientViewer.load({
          container: containerRef.current,
          document: loadUrl,
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
      cancelled = true;
      if (instanceRef.current && window.NutrientViewer) {
        window.NutrientViewer.unload(instanceRef.current);
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
