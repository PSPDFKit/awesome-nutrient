import type { Instance, ToolbarItem } from "@nutrient-sdk/viewer";
import { baseOptions } from "../../shared/base-options";

let selectedStamp: string | null = null;
let instance: Instance | null = null;

function updateCursor(inst: Instance) {
  const contentDoc = inst.contentDocument;
  if (!("host" in contentDoc)) return;

  const container = contentDoc.host as HTMLElement;
  if (selectedStamp) {
    container.style.cursor = "move";
  } else {
    container.style.cursor = "default";
  }
}

// Function to apply stamp to the currently visible page
async function applyStampToCurrentPage(
  inst: Instance,
  stampType: string,
  top = 50,
  left = 50,
  width = 150,
  height = 50,
) {
  // Get the current page index from the view state
  const currentPageIndex = inst.viewState.currentPageIndex;

  const stamp = new window.NutrientViewer.Annotations.StampAnnotation({
    pageIndex: currentPageIndex,
    stampType: stampType,
    boundingBox: new window.NutrientViewer.Geometry.Rect({
      left: left - width / 2,
      top: top - height / 2,
      width: width,
      height: height,
    }),
  });

  // Create the stamp annotation
  await inst.create(stamp);
}

// Function to remove stamp annotations from the current page
async function removeStampFromCurrentPage() {
  if (!instance) return;

  const currentPageIndex = instance.viewState.currentPageIndex;

  // Get all annotations on the current page
  const annotations = await instance.getAnnotations(currentPageIndex);

  // Filter for stamp annotations only
  const stampAnnotations = annotations.filter(
    (annotation) =>
      annotation instanceof window.NutrientViewer.Annotations.StampAnnotation,
  );
  await instance.delete(stampAnnotations);
}

const customStampItems: ToolbarItem[] = [
  {
    type: "custom",
    id: "no-stamp",
    title: "No Stamp",
    dropdownGroup: "custom-stamps",
    onPress: () => removeStampFromCurrentPage(),
  },
  {
    type: "custom",
    id: "stamp-approved",
    title: "Approved Stamp",
    dropdownGroup: "custom-stamps",
    onPress: () => {
      selectedStamp = "Approved";
      if (instance) updateCursor(instance);
    },
  },
  {
    type: "custom",
    id: "stamp-rejected",
    title: "Rejected Stamp",
    dropdownGroup: "custom-stamps",
    onPress: () => {
      selectedStamp = "Rejected";
      if (instance) updateCursor(instance);
    },
  },
  {
    type: "custom",
    id: "stamp-draft",
    title: "Draft Stamp",
    dropdownGroup: "custom-stamps",
    onPress: () => {
      selectedStamp = "Draft";
      if (instance) updateCursor(instance);
    },
  },
];

window.NutrientViewer.load({
  ...baseOptions,
  theme: window.NutrientViewer.Theme.DARK,
  toolbarItems: [
    ...window.NutrientViewer.defaultToolbarItems,
    ...customStampItems,
  ],
}).then((_instance) => {
  instance = _instance;
  instance.addEventListener("page.press", async (event) => {
    if (selectedStamp) {
      await applyStampToCurrentPage(
        _instance,
        selectedStamp,
        event.point.y,
        event.point.x,
      );
      selectedStamp = null; // Reset after applying
      updateCursor(_instance);
    }
  });
});
