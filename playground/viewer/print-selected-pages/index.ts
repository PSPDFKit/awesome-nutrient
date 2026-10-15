import type { Instance } from "@nutrient-sdk/viewer";
import { baseOptions } from "../../shared/base-options";

// Print the current page or selected pages.
// In the default DOM print mode, instance.print() renders every page of the
// document before the print dialog opens, so large documents take a while even
// when the user picks a page range in the dialog. This example exports only the
// selected pages with a keepPages operation, loads that copy in a headless
// instance, and prints the copy. The document open in the viewer stays unchanged.
// Requires the Document Editor component in the license.

// Options shared by the viewer and the print copy. The Playground's
// baseOptions carries a custom theme, so set a built-in one.
const options = { ...baseOptions, theme: NutrientViewer.Theme.DARK };

let isPreparing = false;
let printInstance: Instance | null = null;

// Unload the copy from the previous print job, if it's still loaded.
function unloadPrintInstance(): void {
  if (printInstance) {
    NutrientViewer.unload(printInstance);
    printInstance = null;
  }
}

async function printPages(
  instance: Instance,
  pageIndexes: number[],
): Promise<void> {
  // Respect printing that was disabled on the viewer.
  if (!instance.viewState.allowPrinting) {
    throw new Error("Printing is disabled.");
  }

  // Ignore clicks while the previous request is still exporting and loading.
  // A newer request replaces a copy that is still rendering.
  if (isPreparing) {
    return;
  }
  isPreparing = true;

  try {
    const pdf = await instance.exportPDFWithOperations([
      { type: "keepPages", pageIndexes },
    ]);

    unloadPrintInstance();

    // Same options as the viewer (license and so on), without a user interface.
    // The SDK logs a warning for viewer-only options, such as `container`,
    // that it ignores in headless mode.
    const copy = await NutrientViewer.load({
      ...options,
      headless: true,
      document: pdf,
    });
    printInstance = copy;

    // Unload the copy once the browser finishes printing it.
    window.addEventListener(
      "afterprint",
      () => {
        if (printInstance === copy) {
          unloadPrintInstance();
        }
      },
      { once: true },
    );

    // DOM mode prints from the current window, which then fires `afterprint`.
    // print() throws when the document doesn't allow printing, so unload the
    // copy in that case.
    try {
      copy.print({ mode: NutrientViewer.PrintMode.DOM });
    } catch (error) {
      unloadPrintInstance();
      throw error;
    }
  } finally {
    isPreparing = false;
  }
}

// Convert "1, 3-5" (1-based page numbers) to page indexes (0-based): [0, 2, 3, 4].
function toPageIndexes(instance: Instance, input: string): number[] {
  const total = instance.totalPageCount;
  const pageIndexes: number[] = [];

  for (const part of input.split(",").map((value) => value.trim())) {
    const bounds = part.split("-").map((value) => value.trim());
    const [start, end = start] = bounds.map(Number);
    const isValid =
      bounds.length <= 2 &&
      bounds.every((value) => /^\d+$/.test(value)) &&
      start >= 1 &&
      end <= total &&
      start <= end;

    if (!isValid) {
      throw new Error(
        `Enter pages between 1 and ${total}, for example, 1, 3-5.`,
      );
    }

    for (let pageNumber = start; pageNumber <= end; pageNumber++) {
      pageIndexes.push(pageNumber - 1);
    }
  }

  return pageIndexes;
}

function addControls(instance: Instance): void {
  const panel = document.createElement("div");
  panel.style.cssText =
    "position:fixed;bottom:10px;right:10px;z-index:99999;display:flex;gap:6px;padding:8px;background:#fff;border:1px solid #ccc;border-radius:6px;font:13px system-ui";
  panel.innerHTML = `
    <button id="print-current">Print current page</button>
    <input id="page-numbers" placeholder="1, 3-5" size="10" />
    <button id="print-selected">Print selected pages</button>
  `;
  document.body.appendChild(panel);

  panel.querySelector("#print-current")?.addEventListener("click", () => {
    // `currentPageIndex` is already 0-based.
    printPages(instance, [instance.viewState.currentPageIndex]).catch(
      (error: Error) => {
        console.error("Failed to print the current page:", error.message);
      },
    );
  });

  panel.querySelector("#print-selected")?.addEventListener("click", () => {
    try {
      const input =
        panel.querySelector<HTMLInputElement>("#page-numbers")?.value ?? "";
      printPages(instance, toPageIndexes(instance, input)).catch(
        (error: Error) => {
          console.error("Failed to print the selected pages:", error.message);
        },
      );
    } catch (error) {
      console.error((error as Error).message);
    }
  });
}

NutrientViewer.load(options)
  .then(addControls)
  .catch((error: Error) => {
    console.error("Failed to load document:", error.message);
  });
