import type {
  CustomUI,
  Instance,
  ToolbarItem,
  ViewState,
} from "@nutrient-sdk/viewer";
import { baseOptions } from "../../shared/base-options";

let printHistory: string[] = [];
let instance: Instance | null = null;

function getCurrentDateTime(): string {
  const now = new Date();
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  };
  return now.toLocaleDateString("en-US", options);
}

function logPrintActivity(): void {
  console.log("Logging print activity");
  const printTime = getCurrentDateTime();
  const printEntry = `Printed on ${printTime}`;

  printHistory.unshift(printEntry);

  if (printHistory.length > 10) {
    printHistory = printHistory.slice(0, 10);
  }

  console.log("Print history updated:", printHistory);
  updateCustomUI();
}

function createCustomUI(): CustomUI {
  return {
    [window.NutrientViewer.UIElement.Sidebar]: {
      [window.NutrientViewer.SidebarMode.CUSTOM]: ({ containerNode }) => {
        const container = containerNode as HTMLElement;
        // Clear the container
        container.innerHTML = "";

        const mainContainer = document.createElement("div");
        mainContainer.style.padding = "20px";
        mainContainer.style.height = "100%";
        mainContainer.style.overflowY = "auto";

        // Print activity title
        const printTitle = document.createElement("h4");
        printTitle.innerText = "Print Activity Log";
        printTitle.style.margin = "0 0 15px 0";
        printTitle.style.color = "#fff";

        // History list container
        const historyList = document.createElement("div");
        historyList.style.maxHeight = "400px";
        historyList.style.overflowY = "auto";

        if (printHistory.length > 0) {
          printHistory.forEach((entry, index) => {
            const historyItem = document.createElement("div");
            historyItem.style.background = "#f8f9fa";
            historyItem.style.border = "1px solid #dee2e6";
            historyItem.style.borderRadius = "4px";
            historyItem.style.padding = "10px";
            historyItem.style.marginBottom = "8px";
            historyItem.style.fontSize = "14px";
            historyItem.style.color = "#333";
            const printNumber = printHistory.length - index;
            historyItem.innerHTML = `<strong>Print #${printNumber}</strong><br>${entry}`;
            historyList.appendChild(historyItem);
          });
        } else {
          const noHistory = document.createElement("div");
          noHistory.innerText = "No print activity yet";
          noHistory.style.color = "#6c757d";
          noHistory.style.fontStyle = "italic";
          noHistory.style.textAlign = "center";
          noHistory.style.padding = "20px";
          historyList.appendChild(noHistory);
        }

        mainContainer.appendChild(printTitle);
        mainContainer.appendChild(historyList);
        container.appendChild(mainContainer);

        return { node: containerNode };
      },
    },
  };
}

function updateCustomUI(): void {
  if (!instance) return;
  instance.setCustomUIConfiguration(createCustomUI());
}

function setupPrintEventListeners(): void {
  console.log("Setting up print event listeners");

  window.addEventListener("beforeprint", () => {
    console.log("Before print event detected");
    logPrintActivity();
  });

  window.addEventListener("afterprint", () => {
    console.log("After print event detected");
  });

  document.addEventListener("keydown", (event) => {
    if ((event.ctrlKey || event.metaKey) && event.key === "p") {
      console.log("Print keyboard shortcut detected");
      setTimeout(() => {
        logPrintActivity();
      }, 100);
    }
  });
}

window.NutrientViewer.load({
  ...baseOptions,
  theme: window.NutrientViewer.Theme.DARK,
  enableHistory: true,
  enableClipboardActions: true,
}).then((instanceRef) => {
  console.log("NutrientViewer loaded successfully");
  instance = instanceRef;

  // Set the Custom UI
  instance.setCustomUIConfiguration(createCustomUI());

  // The Sidebar Custom Button with Icon
  const custom: ToolbarItem = {
    type: "custom",
    id: "Print Activity Log",
    title: "Print Activity Log",
    selected: false,
    dropdownGroup: "sidebar",
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
    </svg>`,
    onPress: () => {
      instance?.setViewState((viewState: ViewState) =>
        viewState.set("sidebarMode", "CUSTOM"),
      );
    },
  };

  const toolbarItems = window.NutrientViewer.defaultToolbarItems.reduce<
    ToolbarItem[]
  >(
    (acc, item) =>
      "sidebar-thumbnails" === item.type
        ? acc.concat([item, custom])
        : acc.concat([item]),
    [],
  );

  // Adding it to the sidebars
  instance.setToolbarItems([...toolbarItems]);

  // Set initial view to custom sidebar
  instance.setViewState(instance.viewState.set("sidebarMode", "CUSTOM"));

  // Set up print event listeners
  setupPrintEventListeners();
});

console.log("Script loaded. Print activity will be tracked automatically.");
