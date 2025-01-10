import { showDownloadZipPopup } from './html-blocks.js';

export const classes = [
  {
    id: "drugAllergies",
    title: "Drug Allergies",
    color: { r: 255, g: 192, b: 192 },
  },
  {
    id: "imagingNote",
    title: "Imaging Note",
    color: { r: 209, g: 209, b: 255 },
  },
  {
    id: "labResults",
    title: "Lab Results",
    color: { r: 213, g: 255, b: 213 },
  },
  {
    id: "procedureNotes",
    title: "Procedure Notes",
    color: { r: 100, g: 200, b: 150 },
  },
  {
    id: "providerFacilityNotes",
    title: "Provider-Facility Notes",
    color: { r: 150, g: 100, b: 250 },
  },
  {
    id: "vaccinationsImmunizations",
    title: "Vaccinations-Immunizations",
    color: { r: 120, g: 190, b: 100 },
  },
  {
    id: "documents",
    title: "Documents",
    color: { r: 210, g: 220, b: 110 },
  },
  {
    id: "other",
    title: "Other",
    color: { r: 200, g: 200, b: 200 },
  },
];

// Enable or disable the download button based on whether all pages are finalised
export function enableDownIfAllFinalised() {
  const totalPages = window.instance.totalPageCount;
  // const finalisedData = JSON.parse(
  //   localStorage.getItem("finalisedData") || "[]"
  // );


  // Create a set of all finalised page indices
  const finalisedPages = new Set(
    window.finalisedData.flatMap((item) => {
      if (item.label !== "Temporary")
        return item.pages.map((page) => page.pageIndex);
    })
  );

  finalisedPages.delete(undefined);

  const isEveryPageFinalised = finalisedPages.size === totalPages;

  // Update the download button state
  window.instance.setDocumentEditorToolbarItems((items) => {
    items.map((item) => {
      if (item.id === "DownClasses") {
        item.disabled = !isEveryPageFinalised;
      }
      return item;
    });
    return items;
  });
}

export function downloadFile(buffer, filename) {
  const blob = new Blob([buffer], {
    type: "application/pdf",
  });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Apply stored finalisations to the document UI
export function applyStoredFinalisations() {
  setTimeout(() => {
    // let finalisedData = JSON.parse(
    //   localStorage.getItem("finalisedData") || "[]"
    // );
    clearAllFinalisations();
    window.finalisedData.forEach((item) => {
      item.pages.forEach((page) => {
        page.classes.forEach(async (classId) => {
          const classItem = classes.find((c) => c.id === classId);
          if (classItem) {
            await transformThumbnailUI(page.pageIndex, classItem.color, item.label);
          }
        });
      });
    });
    enableDownIfAllFinalised();
    updateClassificationButtonStates();
  }, 100);
}

// Add this new function to get the currently active classification
export function getActiveClassification() {
  // const finalisedData = JSON.parse(
  //   localStorage.getItem("finalisedData") || "[]"
  // );
  const temporaryItem = window.finalisedData.find(
    (item) => item.label === "Temporary"
  );
  if (temporaryItem && temporaryItem.pages.length > 0) {
    return temporaryItem.pages[0].classes[0];
  }
  return null;
}

// Generate buttons for adding classifications
export function generateAddToClasses(classes) {
  return classes.map((classItem) => {
    return {
      type: "custom",
      id: classItem.id,
      className: classItem.id,
      title: `${classItem.title}`,
      onPress: (event, { setOperations, getSelectedPageIndexes }) => {
        const selectedPages = getSelectedPageIndexes();
        if (selectedPages.length === 0) {
          alert(`Please select some pages to add to ${classItem.title}`);
          return;
        } else {
          const activeClassification = getActiveClassification();
          if (activeClassification && activeClassification !== classItem.id) {
            alert(
              `You can only add pages to the active classification (${
                classes.find((c) => c.id === activeClassification).title
              }). Please finalize the current classification before starting a new one.`
            );
            return;
          }

          // Filter out already finalised pages
          const nonFinalisedPages = selectedPages; //.filter((pageIndex) => !isPageFinalised(pageIndex));

          // if (nonFinalisedPages.length === 0) {
          //   alert(
          //     "All selected pages are already finalised. You cannot add more classifications to finalised pages."
          //   );
          //   return;
          // }

          // if (nonFinalisedPages.length < selectedPages.length) {
          //   alert(
          //     `Some selected pages are already finalised and will be skipped. Proceeding with ${nonFinalisedPages.length} non-finalised pages.`
          //   );
          // }

          // Get existing finalisedData from localStorage
          // let finalisedData = JSON.parse(
          //   localStorage.getItem("finalisedData") || "[]"
          // );
          let existingItem = window.finalisedData.find(
            (item) => item.label === "Temporary"
          );
          if (!existingItem) {
            existingItem = { label: "Temporary", pages: [] };
            window.finalisedData.push(existingItem);
          }

          // Track pages that were actually updated
          let updatedPages = [];

          // Add or update pages in the temporary item
          nonFinalisedPages.forEach((pageIndex) => {
            let existingPage = existingItem.pages.find(
              (p) => p.pageIndex === pageIndex
            );
            if (existingPage) {
              if (!existingPage.classes.includes(classItem.id)) {
                existingPage.classes.push(classItem.id);
                updatedPages.push(pageIndex);
              }
            } else {
              existingItem.pages.push({ pageIndex, classes: [classItem.id] });
              updatedPages.push(pageIndex);
            }
          });

          // Only update UI and localStorage if changes were made
          if (updatedPages.length > 0) {
            // Update UI for updated pages
            updatedPages.forEach(async (pageIndex) => {
              await transformThumbnailUI(pageIndex, classItem.color, "Temporary");
            });

            localStorage.setItem(
              "finalisedData",
              JSON.stringify(window.finalisedData)
            );
            enableDownIfAllFinalised();
            updateClassificationButtonStates();
            alert(
              `Added ${classItem.title} to ${updatedPages.length} page(s).`
            );
          } else {
            alert(
              `The selected class has already been added to all non-finalised pages.`
            );
          }
        }
      },
    };
  });
}

// Add this new function to update classification button states
export function updateClassificationButtonStates() {
  const activeClassification = getActiveClassification();
  window.instance.setDocumentEditorFooterItems((items) => {
    return items.map((item) => {
      if (classes.some((c) => c.id === item.id)) {
        item.disabled =
          activeClassification && item.id !== activeClassification;
        // Update the node property if it exists
        if (item.node) {
          if (item.disabled) {
            item.node.setAttribute("disabled", "disabled");
            item.node.classList.add("disabled");
          } else {
            item.node.removeAttribute("disabled");
            item.node.classList.remove("disabled");
          }
        }
      }
      return item;
    });
  });
}

// Add this function at the top of your index.js file
export function handleSearch(event) {
  if (event.key.toLowerCase() === 'f' && (event.ctrlKey || event.metaKey)) {
    console.log("Search shortcut detected");
    event.preventDefault(); // Prevent the default browser search
    // Do nothing else
  }
}

export async function listenForScrollUI() {
  const scrollContainer = await getScrollContainer();
  if (scrollContainer) {
    let isScrolling = false;
    let lastScrollTime = 0;

    scrollContainer.addEventListener(
      "scroll",
      () => {
        lastScrollTime = Date.now();
        if (!isScrolling) {
          isScrolling = true;
          requestAnimationFrame(async function checkScrollEnd() {
            if (Date.now() - lastScrollTime > 150) {
              isScrolling = false;
              // Scroll ended - reapplying finalizations
              applyStoredFinalisations();
            } else {
              requestAnimationFrame(checkScrollEnd);
            }
          });
        }
      },
      { passive: true }
    );
  } else {
    console.error("Scrollable element not found.");
  }
}

// New method to clear all finalisations from UI
export function clearAllFinalisations() {
  const thumbnails = window.instance.contentDocument.querySelectorAll(
    ".PSPDFKit-DocumentEditor-Thumbnails-Page"
  );

  thumbnails.forEach((thumbnail) => {
    const circleContainer = thumbnail.querySelector(".circle-container");
    if (circleContainer) {
      // Remove all SVG elements (circles) from the container
      circleContainer.innerHTML = '';
      
      thumbnail.removeChild(circleContainer);

      // Reset the thumbnail height to its original value
      thumbnail.style.height = `${parseInt(thumbnail.style.height) - 38}px`;
    }
  });
}

// export const downloadAllClass = {
//   type: "custom",
//   id: "DownClasses",
//   className: "class",
//   title: "Download Zip",
//   disabled: true,
//   onPress: async (event) => {
//     // const finalisedData = JSON.parse(
//     //   localStorage.getItem("finalisedData") || "[]"
//     // );

//     if (window.finalisedData.length === 0) {
//       alert("No finalised pages to download.");
//       return;
//     }

//     const zip = new JSZip();

//     // Loop through each classification
//     await Promise.all(
//       window.finalisedData.map(async (item) => {
//         if (item.pages && item.pages.length > 0) {
//           const classifiedPagesByClass = {};

//           // Organize pages by their classifications
//           item.pages.forEach((page) => {
//             page.classes.forEach((classId) => {
//               if (!classifiedPagesByClass[classId]) {
//                 classifiedPagesByClass[classId] = [];
//               }
//               classifiedPagesByClass[classId].push(page.pageIndex);
//             });
//           });

//           // For each classification, create a folder and add the relevant pages
//           await Promise.all(
//             Object.entries(classifiedPagesByClass).map(
//               async ([classId, pageIndexes]) => {
//                 const classItem = classes.find((c) => c.id === classId);
//                 const folderName = classItem ? classItem.title : "Unknown";

//                 // Create a folder for each classification
//                 const folder = zip.folder(folderName);

//                 // Export classified pages as PDFs
//                 const operations = [
//                   {
//                     type: "keepPages",
//                     pageIndexes: pageIndexes,
//                   },
//                 ];
//                 const pdfBuffer = await window.instance.exportPDFWithOperations(
//                   operations
//                 );

//                 // Add the PDF to the corresponding folder with the item.label as filename
//                 folder.file(`${item.label}.pdf`, pdfBuffer, { binary: true });
//               }
//             )
//           );
//         }
//       })
//     );

//     // Generate the zip file and trigger the download
//     const zipBlob = await zip.generateAsync({ type: "blob" });
//     const link = document.createElement("a");
//     link.href = URL.createObjectURL(zipBlob);
//     link.download = "classified_documents.zip";
//     document.body.appendChild(link);
//     link.click();
//     document.body.removeChild(link);
//   },
// };

export const downloadAllClass = {
  type: "custom",
  id: "DownClasses",
  className: "class",
  title: "Download Zip",
  disabled: true,
  onPress: async (event) => {
    if (window.finalisedData.length === 0) {
      alert("No finalised pages to download.");
      return;
    }

    const folderStructure = {
      title: "Classified_Documents",
      subfolders: []
    };

    // Prepare folder structure information
    window.finalisedData.forEach((item) => {
      if (item.pages && item.pages.length > 0) {
        const classifiedPagesByClass = {};

        item.pages.forEach((page) => {
          page.classes.forEach((classId) => {
            if (!classifiedPagesByClass[classId]) {
              classifiedPagesByClass[classId] = [];
            }
            classifiedPagesByClass[classId].push(page.pageIndex);
          });
        });

        Object.entries(classifiedPagesByClass).forEach(([classId, pageIndexes]) => {
          const classItem = classes.find((c) => c.id === classId);
          const folderName = classItem ? classItem.title : "Unknown";
          
          let subfolder = folderStructure.subfolders.find(sf => sf.title === folderName);
          if (!subfolder) {
            subfolder = { title: folderName, files: [] };
            folderStructure.subfolders.push(subfolder);
          }
          
          subfolder.files.push(`${item.label}.pdf`);
        });
      }
    });

    const handleDownload = async () => {
      const zip = new JSZip();

      // Create zip file (same logic as before)
      await Promise.all(
        window.finalisedData.map(async (item) => {
          if (item.pages && item.pages.length > 0) {
            const classifiedPagesByClass = {};

            item.pages.forEach((page) => {
              page.classes.forEach((classId) => {
                if (!classifiedPagesByClass[classId]) {
                  classifiedPagesByClass[classId] = [];
                }
                classifiedPagesByClass[classId].push(page.pageIndex);
              });
            });

            await Promise.all(
              Object.entries(classifiedPagesByClass).map(
                async ([classId, pageIndexes]) => {
                  const classItem = classes.find((c) => c.id === classId);
                  const folderName = classItem ? classItem.title : "Unknown";

                  const folder = zip.folder(folderName);

                  const operations = [
                    {
                      type: "keepPages",
                      pageIndexes: pageIndexes,
                    },
                  ];
                  const pdfBuffer = await window.instance.exportPDFWithOperations(
                    operations
                  );

                  folder.file(`${item.label}.pdf`, pdfBuffer, { binary: true });
                }
              )
            );
          }
        })
      );

      const zipBlob = await zip.generateAsync({ type: "blob" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(zipBlob);
      link.download = `${folderStructure.title}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.location.reload();
    };

    // Show the popup
    showDownloadZipPopup(folderStructure, handleDownload);
  },
};

export const Clear = {
  type: "custom",
  id: "Clear",
  className: "class",
  title: "Reset",
  disabled: false,
  onPress: async (event) => {
    if (
      confirm(
        "Are you sure you want to reset? This will clear all classifications."
      )
    ) {
      window.finalisedData = [];
      localStorage.clear();
      clearAllFinalisations();
      enableDownIfAllFinalised();
      updateClassificationButtonStates();
      alert("All classifications have been reset.");
    }
  },
};

export const finalise = {
  type: "custom",
  id: "Finalise",
  className: "class",
  title: "Finalise",
  disabled: false,
  onPress: async (event) => {
    // let finalisedData = JSON.parse(
    //   localStorage.getItem("finalisedData") || "[]"
    // );
    const temporaryItem = window.finalisedData.find(
      (item) => item.label === "Temporary"
    );

    if (!temporaryItem || temporaryItem.pages.length === 0) {
      alert("There are no temporary classifications to finalise.");
      return;
    }

    const label = window.prompt("Label for finalised classification:");
    if (label !== null && label !== "") {
      // Create new finalised item with all pages from temporary
      const newItem = {
        label: label,
        pages: [...temporaryItem.pages],
      };

      // Add the new finalised item
      window.finalisedData.push(newItem);

      // Remove the temporary item
      window.finalisedData = window.finalisedData.filter(item => item.label !== "Temporary");

      localStorage.setItem("finalisedData", JSON.stringify(window.finalisedData));
      // console.log("Finalized data:", finalisedData);
      alert(`Finalised ${newItem.pages.length} pages`);
      applyStoredFinalisations();
    }
  },
};

async function transformThumbnailUI(pageIndex, color, label) {
  let thumbnail = null;
  let attempts = 0;
  const maxAttempts = 5;

  while (!thumbnail && attempts < maxAttempts) {
    thumbnail = window.instance.contentDocument.querySelector(
      `.PSPDFKit-DocumentEditor-Thumbnails-Page[data-page-index="${pageIndex}"]`
    );

    if (!thumbnail) {
      attempts++;
      await new Promise(resolve => setTimeout(resolve, 100)); // Wait 100ms before retrying
    }
  }

  if (!thumbnail) {
    // console.error(`Thumbnail for page ${pageIndex} not found`);
    return;
  }

  let circleContainer = thumbnail.querySelector(".circle-container");

  if (!circleContainer) {
    circleContainer = document.createElement("div");
    circleContainer.classList.add("circle-container");
    circleContainer.style.display = "flex";
    circleContainer.style.justifyContent = "center";
    circleContainer.style.alignItems = "center";
    circleContainer.style.height = "28px";
    circleContainer.style.marginTop = "-2px";
    circleContainer.style.marginBottom = "2px";
    circleContainer.style.overflowX = "auto";
    circleContainer.style.overflowY = "hidden";
    circleContainer.style.whiteSpace = "nowrap";
    circleContainer.style.paddingBottom = "5px";

    circleContainer.style.scrollbarWidth = "thin";
    circleContainer.style.scrollbarColor = "#888 #f1f1f1";

    thumbnail.appendChild(circleContainer);

    thumbnail.style.height = `${parseInt(thumbnail.style.height) + 38}px`;
  }

  // Create and add new color circle
  const circle = createColorCircle(color, label !== "Temporary");
  circle.classList.add("color-circle");
  circle.style.flexShrink = "0";
  circle.style.marginRight = "6px";

  // Add tooltip functionality
  if (label !== "Temporary") {
    circle.setAttribute("title", label);
    circle.style.cursor = "pointer";

    // Create a tooltip element
    const tooltip = document.createElement("div");
    tooltip.id = `tooltip-${pageIndex}`;
    tooltip.textContent = label;
    tooltip.style.position = "absolute";
    tooltip.style.backgroundColor = "grey";
    tooltip.style.opacity = 0.6;
    tooltip.style.color = "white";
    tooltip.style.padding = "3px 8px";
    tooltip.style.borderRadius = "3px";
    tooltip.style.zIndex = "1000";
    tooltip.style.display = "none";

    // Show tooltip on mouseover
    circle.addEventListener("mouseover", (e) => {
      tooltip.style.display = "block";
      tooltip.style.left = `${e.pageX + 10}px`;
      tooltip.style.top = `${e.pageY + 10}px`;
      document.body.appendChild(tooltip);
    });

    // Hide tooltip on mouseout
    circle.addEventListener("mouseout", () => {
      tooltip.style.display = "none";
      document.body.removeChild(tooltip);
    });
  }

  circleContainer.appendChild(circle);
}

// Helper function to create a color circle SVG
function createColorCircle(color, hasBorder = false) {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("width", "18");
  svg.setAttribute("height", "18");

  // Define the filter for drop shadow
  const filter = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "filter"
  );
  filter.setAttribute("id", "drop-shadow");
  filter.innerHTML = `
    <feGaussianBlur in="SourceAlpha" stdDeviation="0.7" result="blur"/>
    <feOffset in="blur" dx="0.7" dy="0.7" result="offsetBlur"/>
    <feMerge>
      <feMergeNode in="offsetBlur"/>
      <feMergeNode in="SourceGraphic"/>
    </feMerge>
  `;
  svg.appendChild(filter);

  const circle = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "circle"
  );
  circle.setAttribute("cx", "9");
  circle.setAttribute("cy", "9");
  circle.setAttribute("r", "7.5");
  circle.setAttribute("fill", `rgb(${color.r},${color.g},${color.b})`);

  if (hasBorder) {
    circle.setAttribute("stroke", "black");
    circle.setAttribute("stroke-width", "1");
  }

  circle.setAttribute("filter", "url(#drop-shadow)");

  svg.appendChild(circle);
  return svg;
}

async function getScrollContainer() {
  let attempts = 0;
  while (attempts < 10) {
    const scrollContainer = instance.contentDocument.querySelector(
      '[data-testid="scroll"]'
    );
    if (scrollContainer) {
      return scrollContainer;
    }
    attempts++;
    // console.log("Scroll container not found. Retrying..."+attempts);
    
    await new Promise((resolve) => setTimeout(resolve, 50)); // Retry after 50ms
  }
  return null;
}