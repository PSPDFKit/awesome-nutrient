import type {
  ImageAnnotation,
  InkAnnotation,
  Instance,
} from "@nutrient-sdk/viewer";
import { baseOptions } from "../../shared/base-options";

// Signature type is InkAnnotation | ImageAnnotation
type Signature = InkAnnotation | ImageAnnotation;

let signatureWidgetId: string | null = null; // Store the widget ID for deletion
const signatureFieldName = "Sig1"; // Signature field name
let left1 = 380;
let top2 = 150;
let width3 = 180;
let height4 = 30;

window.NutrientViewer.load({
  ...baseOptions,
  theme: window.NutrientViewer.Theme.DARK,
  isEditableAnnotation: (annotation) => {
    // Check if annotation has isSignature property (InkAnnotation or ImageAnnotation)
    if ("isSignature" in annotation) {
      return !(annotation as InkAnnotation | ImageAnnotation).isSignature;
    }
    return true;
  },
  electronicSignatures: {},
}).then(async (instance: Instance) => {
  // Create a widget annotation for the signature
  const widget = new window.NutrientViewer.Annotations.WidgetAnnotation({
    pageIndex: 0,
    boundingBox: new window.NutrientViewer.Geometry.Rect({
      left: left1,
      top: top2,
      width: width3, // Fixed width
      height: height4, // Fixed height
    }),
    opacity: 0.5, // Make it slightly transparent
    formFieldName: signatureFieldName,
    id: window.NutrientViewer.generateInstantId(),
  });

  // Store the widget ID for later deletion
  signatureWidgetId = widget.id;

  // Create the signature form field
  const formField = new window.NutrientViewer.FormFields.SignatureFormField({
    name: signatureFieldName,
    annotationIds: window.NutrientViewer.Immutable.List([widget.id]),
  });
  await instance.create([widget, formField]);

  instance.addEventListener(
    "inkSignatures.create",
    async (annotation: Signature) => {
      if (signatureWidgetId) {
        await instance.delete(signatureWidgetId);
      }

      // Check if annotation is an ImageAnnotation (has contentType property)
      const isImageAnnotation = "contentType" in annotation;
      const contentType = isImageAnnotation
        ? (annotation as ImageAnnotation).contentType
        : null;
      const fileName = isImageAnnotation
        ? (annotation as ImageAnnotation).fileName
        : null;

      if (
        // creationModes: [window.NutrientViewer.ElectronicSignatureCreationMode.DRAW]
        // InkAnnotation (drawn signature) - no contentType
        !isImageAnnotation
      ) {
        left1 = left1 + 10;
        top2 = top2 - 12;
        width3 = width3 - 50;
        height4 = height4 + 25;
      }
      if (
        // creationModes: [window.NutrientViewer.ElectronicSignatureCreationMode.TYPE]
        contentType === "image/png" &&
        fileName === null
      ) {
        left1 = left1 - 30;
        top2 = top2 - 12;
        width3 = width3 + 200;
        height4 = height4 + 25;
      }
      if (
        // creationModes: [window.NutrientViewer.ElectronicSignatureCreationMode.IMAGE],
        (contentType === "image/png" || contentType === "image/jpeg") &&
        fileName != null
      ) {
        left1 = left1 + 10;
        top2 = top2 - 12;
        width3 = width3 - 50;
        height4 = height4 + 25;
      }

      const Loggedinuser = "Nutrient";
      const signedBy = new window.NutrientViewer.Annotations.TextAnnotation({
        pageIndex: 0,
        text: {
          format: "plain",
          value: `powered by ${Loggedinuser}`,
        },
        boundingBox: new window.NutrientViewer.Geometry.Rect({
          left: left1 + 30,
          top: top2 - 5,
          width: width3 + 100,
          height: 13,
        }),
        font: "Verdana",
        fontSize: 9,
        fontColor: window.NutrientViewer.Color.BLUE,
        horizontalAlign: "left",
        //readOnly: true,
        locked: true,
        lockedContents: true,
        note: "Authenticated user",
        isFitting: false,
      });

      instance.create(signedBy);

      const currentdate = new Date();
      const dateOptions: Intl.DateTimeFormatOptions = {
        day: "2-digit",
        month: "short",
        year: "numeric",
      };
      const formattedDate = currentdate
        .toLocaleDateString("en-GB", dateOptions)
        .replace(",", ""); // Example: "04 Dec 2024"
      const timeOptions: Intl.DateTimeFormatOptions = {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      };
      const formattedTime = currentdate.toLocaleTimeString(
        "en-GB",
        timeOptions,
      ); // Example: "13:45:30"
      const datetime = `${formattedDate} Time: ${formattedTime}`;
      const signedAt = new window.NutrientViewer.Annotations.TextAnnotation({
        pageIndex: 0,
        text: {
          format: "plain",
          value: `Signed @ ${datetime}`,
        },
        boundingBox: new window.NutrientViewer.Geometry.Rect({
          left: left1 + 30,
          top: top2 + 50,
          width: width3 + 100,
          height: 13,
        }),
        font: "Verdana",
        fontSize: 9,
        fontColor: window.NutrientViewer.Color.BLUE,
        horizontalAlign: "left",
        readOnly: true,
      });
      instance.create(signedAt);

      const lineAnno = new window.NutrientViewer.Annotations.LineAnnotation({
        pageIndex: 0,
        startPoint: new window.NutrientViewer.Geometry.Point({
          x: left1 + 20,
          y: top2 - 2,
        }),
        endPoint: new window.NutrientViewer.Geometry.Point({
          x: left1 + 20,
          y: top2 + height4 + 5,
        }),
        boundingBox: new window.NutrientViewer.Geometry.Rect({
          left: left1,
          top: top2,
          width: 20,
          height: 60,
        }),
        locked: true,
        lockedContents: true,
      });
      instance.create(lineAnno);
    },
  );
});
