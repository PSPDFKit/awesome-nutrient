import { useEffect, useRef } from "react";

export default function NutrientPdfViewer(props) {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    let PSPDFKit;

    // Helper: Convert an ArrayBuffer to a hex (base16) string.
    function bufferToHex(buffer) {
      const bytes = new Uint8Array(buffer);
      return Array.from(bytes)
        .map((byte) => byte.toString(16).padStart(2, "0"))
        .join("");
    }

    // Helper: Convert an ArrayBuffer to a Base64 encoded string.
    function arrayBufferToBase64(buffer) {
      let binary = "";
      const bytes = new Uint8Array(buffer);
      bytes.forEach((b) => (binary += String.fromCharCode(b)));
      return window.btoa(binary);
    }

    async function initializeSDK() {
      PSPDFKit = await import("@nutrient-sdk/viewer");
      PSPDFKit.unload(container);

      const instance = await PSPDFKit.load({
        licenseKey: import.meta.env.VITE_lkey,
        container,
        document: props.document,
        baseUrl: `${window.location.protocol}//${window.location.host}/${
          import.meta.env.PUBLIC_URL ?? ""
        }`,
      });

      instance.setViewState((viewState) =>
        viewState.set(
          "showSignatureValidationStatus",
          PSPDFKit.ShowSignatureValidationStatusMode.IF_SIGNED
        )
      );

      // Define the signing callback.
      const signCallback = async ({ dataToBeSigned, fileContents }) => {
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
      // PSPDFKit.defaultToolbarItems is available in PSPDFKit for Web.
      const defaultToolbarItems = PSPDFKit.defaultToolbarItems || [];
      const toolbarItems = [...defaultToolbarItems];

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

    return () => PSPDFKit && PSPDFKit.unload(container);
  }, [props.document]);

  return <div ref={containerRef} style={{ width: "100%", height: "100vh" }} />;
}
