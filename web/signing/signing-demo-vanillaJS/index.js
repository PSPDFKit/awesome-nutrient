import "./assets/pspdfkit.js";
import { enableUserSignatureFields, createDynamicSelect } from "./helpers.js";

// We need to inform PSPDFKit where to look for its library assets, i.e. the location of the `pspdfkit-lib` directory.
const baseUrl = `${window.location.protocol}//${window.location.host}/assets/`;
const instantJSON = JSON.parse(localStorage.getItem("storeState"));
var _instance = null;

const allUsers = [
  { id: "frtyfyzrwsgres4y5x77", name: "User 1", isAdmin: true },
  { id: "frtyfyzrwsgres4y5x78", name: "User 2", isAdmin: false },
  { id: "frtyfyzrwsgres4y5x79", name: "User 3", isAdmin: false },
  { id: "frtyfyzrwsgres4y5x80", name: "User 4", isAdmin: false },
];

const currentUser = allUsers[2];

PSPDFKit.load({
  baseUrl,
  container: "#pspdfkit",
  document: "document.pdf",
  instantJSON,
  toolbarItems: [
    ...PSPDFKit.defaultToolbarItems,
    {
      type: "form-creator",
    },
  ],
}).then(async (instance) => {
  _instance = instance;

  // Enable signature fields for the current user
  await enableUserSignatureFields(instance, currentUser);

  // Enable form creator mode for admin
  if (currentUser.isAdmin) {
    instance.setViewState((viewState) =>
      viewState.set("interactionMode", PSPDFKit.InteractionMode.FORM_CREATOR)
    );
    instance.setViewState((viewState) => viewState.set("showToolbar", true));
    await instance.setToolbarItems([
      ...PSPDFKit.defaultToolbarItems,
      { type: "form-creator" },
    ]);
  }
  // Otherwise, enable pan mode
  else {
    instance.setViewState((viewState) =>
      viewState.set("interactionMode", PSPDFKit.InteractionMode.PAN)
    );
    instance.setViewState((viewState) => viewState.set("showToolbar", false));
    await instance.setToolbarItems([...PSPDFKit.defaultToolbarItems]);
  }

  // Add custom data to signature fields
  instance.addEventListener("annotations.create", async (annotation) => {
    const formFields = await instance.getFormFields();
    const formField = formFields.get(
      formFields.map((e) => e.name).indexOf(annotation.formFieldName)
    );
    annotation = annotation.toArray()[0];
    //If it's a signature widget I activate the Form Creator Mode
    if (
      annotation &&
      formField instanceof PSPDFKit.FormFields.SignatureFormField
    ) {
      const customData = { signer: currentUser };
      const updatedAnnotation = annotation.set("customData", customData);
      const updated = await instance.update(updatedAnnotation);
      console.log("Updated annotation", updated);
    }
    // Save the state of the document in the local storage
    const storeState = await instance.exportInstantJSON();
    localStorage.setItem("storeState", JSON.stringify(storeState));
  });
  //This is the User Role Select Element
  //Event listener to check whehter the clicked annotation is a Signature Widget
  instance.addEventListener("annotations.press", async (event) => {
    const { annotation } = event;
    const formFields = await instance.getFormFields();
    const formField = formFields.get(
      formFields.map((e) => e.name).indexOf(annotation.formFieldName)
    );

    //If it's a signature widget I activate the Form Creator Mode
    if (
      annotation &&
      formField instanceof PSPDFKit.FormFields.SignatureFormField
    ) {
      const { annotation } = event;
      // Current signer to this field
      const signer = annotation.customData.signer.id;

      let html = createDynamicSelect(instance, annotation, allUsers, signer);

      
      //Searching for the Property Expando Control Widget where I'll insert the Select Element
      const expandoControl = instance.contentDocument.querySelector(
        ".PSPDFKit-Expando-Control"
      );
      const containsSelectUser = instance.contentDocument.querySelector("#userRoles");
      if (expandoControl && !containsSelectUser) expandoControl.insertAdjacentElement("beforeBegin", html);

      // Save the state of the document in the local storage
      const storeState = await instance.exportInstantJSON();
      localStorage.setItem("storeState", JSON.stringify(storeState));
    }
  });

  // Store state on delete annotation
  instance.addEventListener("annotations.delete", async (event)=>{
    const storeState = await instance.exportInstantJSON();
    localStorage.setItem("storeState", JSON.stringify(storeState));
  })

  // Add event listner for formField creation
  instance.addEventListener("formFields.create", async (formField) => {
    console.log("Form Field Created", formField);
  });
});
