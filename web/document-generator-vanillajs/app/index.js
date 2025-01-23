const backendUrl = `${window.location.protocol}/${window.location.host}/../`;
const APP = { docAuthSystem: null };
const sections = document.getElementsByTagName("section");

/** Transition */

const transitionSection = document.getElementById("Transition");

function startTransition(message) {
  let msg = message;
  const activeSections = Array.from(sections).filter(
    (section) => !section.classList.contains("none"),
  );
  if (activeSections.length > 0) {
    activeSections[0].classList.add("none");
  }

  if (!message) {
    msg = "Transitioning...";
  }

  transitionSection.getElementsByTagName("h2")[0].innerText = msg;
  transitionSection.classList.remove("none");
}

function endTransitionTo(section) {
  transitionSection.classList.add("none");
  section.classList.remove("none");
}

/**
 * Step 1 - Select Template
 */

const selectTemplateSection = document.getElementById("Step1_SelectTemplate");

APP.template = null;
APP.customTemplateBinary = null;

function initTemplatesSelection() {
  const form = selectTemplateSection.getElementsByTagName("form")[0];
  const fileInput = form.getElementsByTagName("input")[0];
  const buttons = selectTemplateSection.getElementsByTagName("button");

  // auto-upload file when selected
  const selectFileAction = (e) => {
    const file = fileInput.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const binaryData = e.target.result;
      APP.customTemplateBinary = binaryData;
    };
    reader.readAsArrayBuffer(file);
  };

  const selectTemplateAction = (e) => {
    const button = e.target;
    APP.template = button.dataset.tpl;
    if (APP.template === "custom") {
      // validate that we have a file uploaded
      if (APP.customTemplateBinary == null) {
        return;
      }
    }
    goTemplateEditor();
  };

  for (const button of buttons) {
    button.addEventListener("click", selectTemplateAction);
  }
  fileInput.addEventListener("change", selectFileAction);

  selectTemplateSection.dataset.initialized = "yes";
}

function goTemplatesSelection() {
  startTransition("Preparing templates...");

  if (selectTemplateSection.dataset.initialized === "no") {
    initTemplatesSelection();
  }

  endTransitionTo(selectTemplateSection);
}

/**
 * Step 2 - Edit Template
 *
 * Document Authoring SDK > First-class JSON support with DocJSON
 * https://www.nutrient.io/guides/document-authoring/working-with-documents/docjson/
 *
 * Document Authoring SDK > Import and export DOCX files effectively
 * https://www.nutrient.io/guides/document-authoring/working-with-documents/docx/
 *
 */

APP.templateEditor = null;
APP.templateDocument = null;

const editTemplateSection = document.getElementById("Step2_EditTemplate");

function initTemplateEditor() {
  const doButtonAction = (e) => {
    const action = e.target.dataset.action;
    APP.templateEditor.destroy();
    if (action === "back-to-template-selection") {
      APP.templateDocument = null;
      goTemplatesSelection();
    } else if (action === "to-json-data") {
      goDataEditor();
    }
  };

  const buttons = editTemplateSection.getElementsByTagName("button");
  for (const button of buttons) {
    button.addEventListener("click", doButtonAction);
  }
  editTemplateSection.dataset.initialized = "yes";
}

function goTemplateEditor() {
  if (editTemplateSection.dataset.initialized === "no") {
    initTemplateEditor();
  }

  startTransition("Preaparing template editor...");

  const editorElement =
    editTemplateSection.getElementsByClassName("nutri-editor")[0];
  (async () => {
    // init doc. authoring
    if (APP.docAuthSystem === null) {
      APP.docAuthSystem = await DocAuth.createDocAuthSystem();
    }

    // prepare the template document
    if (APP.templateDocument === null) {
      const templateDocument =
        APP.template === "custom"
          ? await APP.docAuthSystem.importDOCX(APP.customTemplateBinary) // import custom template DOCX
          : await APP.docAuthSystem.loadDocument(
              await fetch(`${backendUrl}templates/${APP.template}.json`).then(
                (response) => response.json(),
              ),
            ); // or load preselected template DocJSON
      APP.templateDocument = templateDocument;
    }

    // initialize editor
    const editor = await APP.docAuthSystem.createEditor(editorElement, {
      document: APP.templateDocument,
    });
    APP.templateEditor = editor;

    // transition in
    endTransitionTo(editTemplateSection);
  })();
}

/**
 * Step 3 - Edit Data
 *
 * CodeMirror Documentation
 * https://codemirror.net/docs/
 */

const editDataSection = document.getElementById("Step3_EditData");

APP.dataEditor = null;
APP.dataJson = null;

function initoDataEditor() {
  const doButtonAction = (e) => {
    const textarea = APP.dataEditor.getTextArea();
    APP.dataEditor.toTextArea();
    APP.dataJson = JSON.parse(textarea.value);
    textarea.remove();

    const action = e.target.dataset.action;
    if (action === "back-to-template-editor") {
      APP.dataJson = null;
      goTemplateEditor();
    } else if (action === "to-docx-editor") {
      goDocxEditor();
    }
  };

  const buttons = editDataSection.getElementsByTagName("button");
  for (const button of buttons) {
    button.addEventListener("click", doButtonAction);
  }

  editDataSection.dataset.initialized = "yes";
}

function goDataEditor() {
  if (editDataSection.dataset.initialized === "no") {
    initoDataEditor();
  }

  startTransition("Preparing data JSON ...");

  (async () => {
    // get the template JSON data
    if (APP.dataJson === null) {
      const dataJson = await fetch(
        `${backendUrl}data/${APP.template}.json`,
      ).then((response) => response.json());
      APP.dataJson = dataJson;
    }

    // load into textarea
    const textarea = document.createElement("textarea");
    textarea.lines = 50;
    textarea.value = JSON.stringify(APP.dataJson, null, 2);
    const container = document.getElementById("jsonEditor");
    container.appendChild(textarea);

    // transition in
    endTransitionTo(editDataSection);

    // initialize JSON editor
    const editor = CodeMirror.fromTextArea(textarea, {
      mode: { name: "javascript", json: true },
      theme: "default",
      tabSize: 2,
    });
    APP.dataEditor = editor;
  })();
}

/**
 * Step 4 - Edit Generated DOCX
 *
 * Web SDK > Generate PDFs from a Word Template Using JavaScript
 * https://www.nutrient.io/guides/web/pdf-generation/from-word-template/
 *
 * Document Authoring SDK > Import and export DOCX files effectively
 * https://www.nutrient.io/guides/document-authoring/working-with-documents/docx/
 */

const editGeneratedDocxSection = document.getElementById(
  "Step4_EditGeneratedDocx",
);

APP.docxEditor = null;
APP.docxDocument = null;

function initDocxEditor() {
  const doButtonAction = (e) => {
    APP.docxEditor.destroy();

    const action = e.target.dataset.action;
    if (action === "back-to-edit-data") {
      APP.docxDocument = docxDocument = null;
      goDataEditor();
    } else if (action === "generate-pdf") {
      goPdfViewer();
    }
  };

  const buttons = editGeneratedDocxSection.getElementsByTagName("button");
  for (const button of buttons) {
    button.addEventListener("click", doButtonAction);
  }

  editGeneratedDocxSection.dataset.initialized = "yes";
}

function goDocxEditor() {
  if (editGeneratedDocxSection.dataset.initialized === "no") {
    initDocxEditor();
  }

  startTransition("Opening generated DOCX file...");

  const editorElement =
    editGeneratedDocxSection.getElementsByClassName("nutri-editor")[0];
  (async () => {
    // get template & resolve to DOCX
    if (APP.docxDocument == null) {
      const templateBuffer = await APP.templateDocument.exportDOCX();
      const docxBuffer = await PSPDFKit.populateDocumentTemplate(
        { document: templateBuffer },
        APP.dataJson,
      );
      const docxDocument = await APP.docAuthSystem.importDOCX(docxBuffer);
      APP.docxDocument = docxDocument;
    }

    // initialize editor
    const editor = await APP.docAuthSystem.createEditor(editorElement, {
      document: APP.docxDocument,
    });
    APP.docxEditor = editor;

    // transition in
    endTransitionTo(editGeneratedDocxSection);
  })();
}

/**
 * Step 5 - Preview PDF
 *
 * Document Authoring SDK > Export PDF as ArrayBuffer
 * https://www.nutrient.io/guides/document-authoring/working-with-documents/pdf/#exporting-pdf
 *
 * Web SDK > Open PDFs from an ArrayBuffer
 * https://www.nutrient.io/guides/web/open-a-document/from-arraybuffer
 *
 * Web SDK > Download an Exported Document
 * Https://www.nutrient.io/guides/web/knowledge-base/download-exported-document
 */

const viewPdfSection = document.getElementById("Step5_PreviewPDF");

APP.pdfViewer = null;

function initPdfViewer() {
  const downloadPdf = (objectUrl) => {
    const a = document.createElement("a");
    a.href = objectUrl;
    a.style.display = "none";
    a.download = "download.pdf";
    a.setAttribute("download", "download.pdf");
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const doButtonAction = (e) => {
    const action = e.target.dataset.action;
    if (action === "back-to-edit-docx") {
      PSPDFKit.unload(APP.pdfViewer);
      APP.pdfViewer = null;
      goDocxEditor();
    } else if (action === "download-pdf") {
      startTransition("Preparing PDF...");
      (async () => {
        const buffer = await APP.pdfViewer.exportPDF();
        const blob = new Blob([buffer], { type: "application/pdf" });
        const objectUrl = window.URL.createObjectURL(blob);

        endTransitionTo(viewPdfSection);
        downloadPdf(objectUrl);
        window.URL.revokeObjectURL(objectUrl);
      })();
    }
  };

  const buttons = viewPdfSection.getElementsByTagName("button");
  for (const button of buttons) {
    button.addEventListener("click", doButtonAction);
  }

  viewPdfSection.dataset.initialized = "yes";
}

function goPdfViewer() {
  if (viewPdfSection.dataset.initialized === "no") {
    initPdfViewer();
  }

  startTransition("Opening generated PDF file...");

  (async () => {
    // resolve DOCX as PDF
    const pdfBuffer = await APP.docxDocument.exportPDF();

    // load the PDF into Web SDK viewer
    const viewer = await PSPDFKit.load({
      baseUrl: `${backendUrl}web-sdk/`,
      container: "#pspdfkit",
      document: pdfBuffer,
    });
    APP.pdfViewer = viewer;

    // transition in
    endTransitionTo(viewPdfSection);
  })();
}

// On Load
(() => {
  // Clicking the title or logo reloads the generator
  document.getElementById("theTitle").addEventListener("click", (e) => {
    window.location.reload();
  });

  // Start by selecting a template
  goTemplatesSelection();
})();
