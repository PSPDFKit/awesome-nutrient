export const getUserAnnotations = async (instance, user) => {
  let annotations = [];
  for (let i = 0; i < instance.totalPageCount; i++) {
    let ann = await instance.getAnnotations(i);
    ann.forEach((annotation) => {
      if (annotation.customData && annotation.customData.signer.id == user.id) {
        annotations.push(annotation.formFieldName);
      }
    });
  }
  return annotations;
};

export const enableUserSignatureFields = async (instance, user) => {
  const userFieldNames = await getUserAnnotations(instance,user);
  const allFormFields = await instance.getFormFields();
  const signatureFormFields = allFormFields.filter(
    (field) => field instanceof PSPDFKit.FormFields.SignatureFormField
  );
  const readOnlyFormFields = signatureFormFields
    .map((it) => {
      if (userFieldNames.includes(it.name)) {
        return it.set("readOnly", false);
      } else {
        return it.set("readOnly", true);
      }
    })
    .filter(Boolean); // Filter out undefined values
  await instance.update(readOnlyFormFields);
};

export function createDynamicSelect(
  instance,
  annotation,
  options,
  selectedID = "none"
) {
  // Create main container div
  const mainDiv = document.createElement("div");
  mainDiv.className = "PSPDFKit-71h65asx9k85mdns4n8j2kt3ag";

  // Create inner divs
  const innerDiv1 = document.createElement("div");
  const innerDiv2 = document.createElement("div");
  innerDiv2.className = "PSPDFKit-4q6rf47rhqhrpm9gdfefxt7qxa";

  // Create label
  const label = document.createElement("label");
  label.className = "PSPDFKit-nt12adttbyb52awsgj2pvucxy";
  label.textContent = "Assign To User: ";

  // Create select element
  const select = document.createElement("select");
  select.id = "userRoles";
  select.className =
    "PSPDFKit-38cjpvxsadupm25h2qyxa7n5gd PSPDFKit-3yju2u277834cy3gahr2r5pxwa PSPDFKit-Form-Creator-Editor-Form-Field-Name";

  // Add event listener to update the annotation when the select value changes
  select.addEventListener("change", async (event) => {
    const newSelectedID = event.target.value;
    console.log("Selected ID:", newSelectedID);
    // Update the annotation with the new signer
    const customData = {
      signer: options.find((option) => option.id === newSelectedID),
    };
    const updatedAnnotation = annotation.set("customData", customData);
    instance.update(updatedAnnotation).then((updated) => {
      console.log("Updated annotation", updated);
    });

    // Save the state of the document in the local storage
    const storeState = await instance.exportInstantJSON();
    localStorage.setItem("storeState", JSON.stringify(storeState));
  });

  // Create options dynamically
  const isIDInOptions =
    options.filter((option) => option.id === selectedID).length > 0;
  options.forEach((thisOption) => {
    const option = document.createElement("option");
    option.value = thisOption.id;
    option.textContent = thisOption.name;
    option.selected = isIDInOptions
      ? selectedID === thisOption.id
      : thisOption.isAdmin;
    select.appendChild(option);
  });

  // Assemble the elements
  label.appendChild(select);
  innerDiv2.appendChild(label);
  innerDiv1.appendChild(innerDiv2);
  mainDiv.appendChild(innerDiv1);

  // Return the main container
  return mainDiv;
}
