import { useEffect, useRef } from "react";
export default function PdfViewerComponent(props) {
  const containerRef = useRef(null);
  let PSPDFKit, instance;
  useEffect(() => {
    const container = containerRef.current;

    // Create the popup for the dropdown
    const showPopup = () => {
      const existingPopup = document.getElementById("customPopup");
      if (existingPopup) {
        existingPopup.remove();
        document.getElementById("popupOverlay").remove();
      }

      const popup = document.createElement("div");
      popup.innerHTML = `
        <div id="customPopup" style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: white; padding: 20px; border: 1px solid #ccc; box-shadow: 0 0 10px rgba(0,0,0,0.1); z-index: 1000;">
          <label class="PSPDFKit-nt12adttbyb52awsgj2pvucxy PSPDFKit-Form-Creator-Editor-Text-Input-Label">
            Update Form Field Name* 
            <select required id="myCustomDropdown" class="PSPDFKit-38cjpvxsadupm25h2qyxa7n5gd PSPDFKit-3yju2u277834cy3gahr2r5pxwa PSPDFKit-Form-Creator-Editor-Form-Field-Name">
              <option value="" selected disabled>Select Name</option>
                          <option value="FieldName1">Field Name 1</option>
                          <option value="FieldName2">Field Name 2</option>
                          <option value="FieldName3">Field Name 3</option>
                          <option value="FieldName4">Field Name 4</option>
                          <option value="FieldName5">Field Name 5</option>
                          <option value="FieldName6">Field Name 6</option>
            </select>
          </label>
        </div>
        <div id="popupOverlay" style="position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0, 0, 0, 0.5); z-index: 999;"></div>
      `;

      // Append the popup to the document body
      document.body.appendChild(popup);

      // Add event listener to close the popup when clicking on the overlay
      document.getElementById("popupOverlay").addEventListener("click", () => {
        document.getElementById("customPopup").remove();
        document.getElementById("popupOverlay").remove();
      });
    };

    (async function () {
      PSPDFKit = await import("pspdfkit");
      PSPDFKit.unload(container); // Ensure that there's only one PSPDFKit instance.

      // Insert custom item at the desired position
      const toolbarItems = [...PSPDFKit.defaultToolbarItems, { "type": "form-creator" }, { "type": "content-editor" }];

      instance = await PSPDFKit.load({
        licenseKey: import.meta.env.VITE_lkey,
        container,
        document: props.document,
        baseUrl: `${window.location.protocol}//${window.location.host}/${import.meta.env.PUBLIC_URL ?? ""}`,
        toolbarItems: toolbarItems,
      }).then((instance) => {

        // Event listener for pressing an annotation
        instance.addEventListener("annotations.press", async (event) => {
          const { annotation } = event,
            formFields = await instance.getFormFields(),
            formField = formFields.get(
              formFields.map((e) => e.name).indexOf(annotation.formFieldName)
            );
          // Check if the annotation is a form field (or other criteria you may need)
          if (annotation && formField) {
            // Insert the dropdown into the expando control for modifying the form field name
            if (annotation.formFieldName && !instance.viewState.interactionMode.FORM_CREATOR) {
            instance.setSelectedAnnotation(annotation.id);
            instance.contentDocument
              .querySelector(".PSPDFKit-Expando-Control")
              .insertAdjacentHTML("beforeBegin", showPopup());
            }
          }
        });

        // Event listener to handle form field name change from dropdown on annotation selection change
        instance.addEventListener("annotationSelection.change", async (annotations) => {
          if (annotations && annotations.size !== 0 && instance.viewState.interactionMode) {
            const annotation = annotations.first(); // Get the first selected annotation
            if (annotation.formFieldName && instance.viewState.interactionMode) {
              showPopup(); // Show the popup when form field is selected

              setTimeout(() => {
                // Add event listener to dropdown
                  // Add event listener to the dropdown to handle changes
                  document.getElementById("myCustomDropdown").addEventListener("change", async (event) => {
                    const value = event.target.value;
                
                    // Update the form field name in PSPDFKit
                    const formFields = await instance.getFormFields();
                    const formField = formFields.find(f => f.name === annotation.formFieldName);
                
                    if (formField) {
                        const updatedFormField = formField.set("name", value);
                        await instance.update(updatedFormField);
                
                        const updatedAnnotation = annotation.set("formFieldName", value);
                        await instance.update(updatedAnnotation);
                
                        // Refresh the input field's displayed value
                        const formFieldInput = document.querySelector(".PSPDFKit-Form-Creator-Editor-Form-Field-Name");
                        if (formFieldInput) {
                            formFieldInput.value = value;
                            
                            // Temporarily remove focus, then restore it
                            formFieldInput.blur();
                            setTimeout(() => {
                                formFieldInput.focus();
                            }, 100);
                        }

                        // Programmatically press ESC twice
                            const escEvent = new KeyboardEvent("keydown", {
                              key: "Escape",
                              keyCode: 27,
                              code: "Escape",
                              which: 27,
                              bubbles: true,
                          });

                          // Dispatch the Escape event twice with a short delay between them
                          formFieldInput.dispatchEvent(escEvent);
                
                        console.log("Updated Form Field:", updatedFormField.toJS());
                        console.log("Updated Annotation:", updatedAnnotation.toJS());
                    } else {
                        console.error("Form field not found.");
                    }
                });
                
                
                
              }, 0);
            }
          }
        });
      });

      // Cleanup on component unmount
      return () => {
        PSPDFKit.unload(container);
      };
    })();
  }, [props.document]);

  return (
    <div>
      <div ref={containerRef} style={{ width: "100%", height: "100vh" }} />
    </div>
  );
}
