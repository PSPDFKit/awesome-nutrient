

// import { useEffect, useRef } from "react";
// export default function PdfViewerComponent(props) {
//   const containerRef = useRef(null);
//   let PSPDFKit, instance;
//   useEffect(() => {
//     const container = containerRef.current;

//     // Create the popup for the dropdown
//     const showPopup = () => {
//       const existingPopup = document.getElementById("customPopup");
//       if (existingPopup) {
//         existingPopup.remove();
//         document.getElementById("popupOverlay").remove();
//       }

//       const popup = document.createElement("div");
//       popup.innerHTML = `
//         <div id="customPopup" style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: white; padding: 20px; border: 1px solid #ccc; box-shadow: 0 0 10px rgba(0,0,0,0.1); z-index: 1000;">
//           <label class="PSPDFKit-nt12adttbyb52awsgj2pvucxy PSPDFKit-Form-Creator-Editor-Text-Input-Label">
//             Update Form Field Name* 
//             <select required id="myCustomDropdown" class="PSPDFKit-38cjpvxsadupm25h2qyxa7n5gd PSPDFKit-3yju2u277834cy3gahr2r5pxwa PSPDFKit-Form-Creator-Editor-Form-Field-Name">
//               <option value="" selected disabled>Select Name</option>
//                           <option value="FieldName1">Field Name 1</option>
//                           <option value="FieldName2">Field Name 2</option>
//                           <option value="FieldName3">Field Name 3</option>
//                           <option value="FieldName4">Field Name 4</option>
//                           <option value="FieldName5">Field Name 5</option>
//                           <option value="FieldName6">Field Name 6</option>
//             </select>
//           </label>
//           <button id="popupCloseButton" style="margin-top: 10px;">Close</button>
//         </div>
//         <div id="popupOverlay" style="position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0, 0, 0, 0.5); z-index: 999;"></div>
//       `;

//       // Append the popup to the document body
//       document.body.appendChild(popup);

//       // Add event listener to close the popup
//       document.getElementById("popupCloseButton").addEventListener("click", () => {
//         document.getElementById("customPopup").remove();
//         document.getElementById("popupOverlay").remove();
//       });
//     };

//     (async function () {
//       PSPDFKit = await import("pspdfkit");
//       PSPDFKit.unload(container); // Ensure that there's only one PSPDFKit instance.

//       // Insert custom item at the desired position
//       const toolbarItems = [...PSPDFKit.defaultToolbarItems, {"type": "form-creator"}, {"type": "content-editor"}];

//       instance = await PSPDFKit.load({
//         licenseKey: import.meta.env.VITE_lkey,
//         container,
//         document: props.document,
//         baseUrl: `${window.location.protocol}//${window.location.host}/${
//           import.meta.env.PUBLIC_URL ?? ""
//         }`,
//         toolbarItems: toolbarItems,
//         onWidgetAnnotationCreationStart: (annotation, formField) => {
//           console.log("logic goes here....");
//           // Ensure annotation and formField exist
//           if (!annotation || !annotation.boundingBox || !formField) {
//             console.error("Annotation, formField, or boundingBox is missing.");
//             return;
//           }
//           console.log("Annotation BoundingBox:", annotation.boundingBox);
//           console.log("FormField: ", formField);

//           // Show the popup
//           showPopup();

//           const randomStr = PSPDFKit.generateInstantId();
//           return {
//             annotation: annotation.set("formFieldName", `Custom-${randomStr}`),
//             formField: formField.set("name", `Custom-${randomStr}`),
//           };
//         }
//       }).then((instance) => {
//         console.log("I want to write some code here");

//         // Event listener to handle form field name change from dropdown on annotation selection change
//         instance.addEventListener("annotationSelection.change", async (annotations) => {
//           if (annotations && annotations.size !== 0 && instance.viewState.interactionMode) {
//             const annotation = annotations.first(); // Get the first selected annotation
//             if (annotation && annotation.formFieldName) {
//               showPopup(); // Show the popup when form field is selected

//               setTimeout(() => {
//                 // Add event listener to dropdown
//                 document
//                   .getElementById("myCustomDropdown")
//                   .addEventListener("change", async (event) => {
//                     const value = event.target.value;
//                     const updatedAnnotation = annotation.set("formFieldName", value);

//                     // Update the annotation
//                     console.log(updatedAnnotation.toJS());

//                     // Get the form fields and filter the correct form field
//                     const formFields = await instance.getFormFields();
//                     const filteredFormFields = formFields.filter(
//                       (formField) => formField.name === annotation.formFieldName
//                     );

//                     if (filteredFormFields && filteredFormFields.size > 0) {
//                       const updatedFormField = filteredFormFields.first().set("name", value);
//                       instance.update(updatedFormField); // Update the form field
//                       console.log("Updated Form Field:", updatedFormField.toJS());
//                     } else {
//                       console.error("Form field not found or size is zero.");
//                     }

//                     instance.update(updatedAnnotation); // Update the annotation
//                     console.log("Updated Annotation:", updatedAnnotation.toJS());
//                   });
//               }, 0);
//             }
//           }
//         });
//       });

//       // Cleanup on component unmount
//       return () => {
//         PSPDFKit.unload(container);
//       };
//     })();
//   }, [props.document]);

//   return (
//     <div>
//       <div ref={containerRef} style={{ width: "100%", height: "100vh" }} />
//     </div>
//   );
// }
