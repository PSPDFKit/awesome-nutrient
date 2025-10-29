import { useEffect, useRef } from "react";

interface NutrientPdfViewerProps {
  document: string;
}

type ViewState = InstanceType<typeof NutrientViewer.ViewState>;

export default function NutrientPdfViewer(props: NutrientPdfViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;

    // Helper: Convert an ArrayBuffer to a hex (base16) string.
    function bufferToHex(buffer: ArrayBuffer): string {
      const bytes = new Uint8Array(buffer);
      return Array.from(bytes)
        .map((byte) => byte.toString(16).padStart(2, "0"))
        .join("");
    }

    // Helper: Convert an ArrayBuffer to a Base64 encoded string.
    function arrayBufferToBase64(buffer: ArrayBuffer): string {
      let binary = "";
      const bytes = new Uint8Array(buffer);
      bytes.forEach((b) => {
        binary += String.fromCharCode(b);
      });
      return window.btoa(binary);
    }

    async function initializeSDK() {
      if (!container) return;
      if (!NutrientViewer) {
        console.error(
          "NutrientViewer not loaded. Make sure the CDN script is included."
        );
        return;
      }

      NutrientViewer.unload(container);

      const instance = await NutrientViewer.load({
        //licenseKey: import.meta.env.VITE_lkey,
        container,
        document: props.document,
        baseUrl: `${window.location.protocol}//${window.location.host}/${
          import.meta.env.PUBLIC_URL ?? ""
        }`,
      });

      instance.setViewState((viewState: ViewState) =>
        viewState.set(
          "showSignatureValidationStatus",
          NutrientViewer.ShowSignatureValidationStatusMode.IF_SIGNED
        )
      );

      // Define the signing callback.
      const signCallback = async ({
        dataToBeSigned,
        fileContents,
      }: {
        dataToBeSigned: ArrayBuffer;
        fileContents: ArrayBuffer;
      }) => {
        try {
          const hashBuffer = await crypto.subtle.digest(
            "SHA-256",
            dataToBeSigned
          );
          const digestHex = bufferToHex(hashBuffer);
          const encodedContents = arrayBufferToBase64(fileContents);

          const payload = {
            action: "sign_pkcs7",
            digest: digestHex,
            encoded_contents: encodedContents,
            signature_type: "cms",
            signing_token: JSON.stringify({
              userId: "user-1-with-rights",
              signMethod: "privatekey",
            }),
          };

          const response = await fetch("/sign", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
          });

          if (!response.ok) {
            throw new Error(`Signing service error: ${response.statusText}`);
          }

          // Get the response as an ArrayBuffer (binary DER data).
          const signatureData = await response.arrayBuffer();
          // Return the signature wrapped as a PKCS7 response.
          return { pkcs7: signatureData };
        } catch (error) {
          console.error("Error during signing:", error);
          throw error;
        }
      };

      // Build toolbar items using default items if available.
      const toolbarItems = [NutrientViewer.defaultToolbarItems];

      // Add our custom "Digitally Sign" button.
      toolbarItems.push({
        type: "custom",
        id: "digitally-sign",
        title: "Digitally Sign",
        onPress: async () => {
          try {
            await instance.signDocument(null, signCallback);
            console.log("Document signed!");
          } catch (error) {
            console.error("Error signing document via custom button:", error);
          }
        },
      });

      // Update the toolbar with our new items.
      instance.setToolbarItems(toolbarItems);
    }

    initializeSDK();

    return () => NutrientViewer?.unload(container);
  }, [props.document]);

  return <div ref={containerRef} style={{ width: "100%", height: "100vh" }} />;
}
