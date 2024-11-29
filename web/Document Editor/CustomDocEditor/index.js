const PSPDFKit = window.PSPDFKit;
import {
  classes,
  applyStoredFinalisations,
  downloadAllClass,
  generateAddToClasses,
  Clear,
  finalise,
  handleSearch,
  listenForScrollUI,
} from "./helpers.js";

// We need to inform PSPDFKit where to look for its library assets, i.e. the location of the `pspdfkit-lib` directory.
// const baseUrl = "https://cdn.cloud.pspdfkit.com/pspdfkit-web@2024.5.2/";
const baseUrl = `${window.location.protocol}//${window.location.host}/assets/`;

const classButtons = generateAddToClasses(classes);

// Calculate the middle index to split the array
const middleIndex = Math.ceil(classButtons.length / 2);

// Split the classButtons array
const firstHalfClassButtons = classButtons.slice(0, middleIndex);
const secondHalfClassButtons = classButtons.slice(middleIndex);

// Add the node property to secondHalfClassButtons
const modifiedSecondHalfClassButtons = classButtons.map((button) => {
  const node = document.createElement("button");
  node.className = `PSPDFKit-8ehcbhz241z1tfyhjztbe12ube PSPDFKit-5hqvpgcgpf1769cn35dvtg4ktz ${button.className} PSPDFKit-Toolbar-Button PSPDFKit-Tool-Button`;
  node.title = button.title;
  node.setAttribute("aria-label", button.title);
  node.type = "button";

  const span = document.createElement("span");
  span.textContent = button.title;
  node.appendChild(span);

  return {
    ...button,
    node,
  };
});

const docEditToolItems = [
  // ...firstHalfClassButtons,
  { type: "zoom-in", dropdownGroup: "x" },
  { type: "zoom-out", dropdownGroup: "x" },
  { type: "select-none", dropdownGroup: "x" },
  downloadAllClass,
  Clear,
  finalise,
];

const docEditFootItems = [
  // downloadAllClass,
  ...modifiedSecondHalfClassButtons,
  // ...PSPDFKit.defaultDocumentEditorFooterItems,
];


function initializePSPDFKit(pdfArrayBuffer) {
  document.getElementById('drop-area').style.display = 'none';
  document.getElementById('pspdfkit').style.display = 'block';

  let pspdfkitConfig = {
    baseUrl,
    container: "#pspdfkit",
    document: pdfArrayBuffer,
    toolbarItems: [...PSPDFKit.defaultToolbarItems],
    documentEditorToolbarItems: [...docEditToolItems],
    documentEditorFooterItems: [...docEditFootItems],
    // initialViewState: new PSPDFKit.ViewState().set("interactionMode",PSPDFKit.InteractionMode.DOCUMENT_EDITOR),
    styleSheets: [`/style.css`],
  }
  
  // let licenseKey = process.env.PSPDFKIT_LICENSE_KEY;
  // if (licenseKey) {
  //   pspdfkitConfig = { ...pspdfkitConfig, licenseKey };
  // }

  PSPDFKit.load(pspdfkitConfig)
    .then(async (instance) => {
      // console.clear();
      window.instance = instance;
      window.finalisedData = JSON.parse(
        localStorage.getItem("finalisedData") || "[]"
      );
      
      instance.addEventListener(
        "viewState.change",
        (viewState, previousViewState) => {
          if (
            viewState.get("interactionMode") ===
            PSPDFKit.InteractionMode.DOCUMENT_EDITOR
          ) {
            applyStoredFinalisations();
          }
        }
      );
      instance.contentDocument.addEventListener('keydown', handleSearch);
      await instance.setViewState(viewState =>
        viewState.set(
          "interactionMode",
          PSPDFKit.InteractionMode.DOCUMENT_EDITOR
        )
      );
      applyStoredFinalisations();
      await listenForScrollUI();
    })
    .catch((error) => {
      console.error(error.message);
      document.getElementById('status').textContent = "Error initializing PDF viewer. Please try again.";
    });
}

function uploadDoc() {
  const dropArea = document.getElementById('drop-area');
  const fileInput = document.getElementById('file-input');
  const uploadButton = document.getElementById('upload-button');
  const status = document.getElementById('status');

  ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    dropArea.addEventListener(eventName, preventDefaults, false);
  });

  function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
  }

  ['dragenter', 'dragover'].forEach(eventName => {
    dropArea.addEventListener(eventName, highlight, false);
  });

  ['dragleave', 'drop'].forEach(eventName => {
    dropArea.addEventListener(eventName, unhighlight, false);
  });

  function highlight() {
    dropArea.classList.add('highlight');
  }

  function unhighlight() {
    dropArea.classList.remove('highlight');
  }

  dropArea.addEventListener('drop', handleDrop, false);
  fileInput.addEventListener('change', handleFiles, false);
  uploadButton.addEventListener('click', () => fileInput.click());

  function handleDrop(e) {
    const dt = e.dataTransfer;
    const files = dt.files;
    handleFiles(files);
  }

  function handleFiles(files) {
    if (files instanceof FileList) {
      ([...files]).forEach(uploadFile);
    } else if (files.target && files.target.files) {
      ([...files.target.files]).forEach(uploadFile);
    }
  }

  function uploadFile(file) {
    if (file.type !== "application/pdf") {
      status.textContent = "Please upload a valid PDF file.";
      return;
    }

    status.textContent = "Uploading...";
    
    const reader = new FileReader();
    reader.onload = function(e) {
      status.textContent = "Upload successful. Initializing PDF viewer...";
      const lastFileName = localStorage.getItem('lastFileName') || '';

      // If the file name has changed, remove the finalised data
      if(file.name !== lastFileName){
        localStorage.setItem('lastFileName', file.name);
        localStorage.removeItem('finalisedData');
      }

      initializePSPDFKit(e.target.result);
    };
    reader.readAsArrayBuffer(file);
  }
}

// Call the uploadDoc function when the page loads
document.addEventListener('DOMContentLoaded', uploadDoc);
