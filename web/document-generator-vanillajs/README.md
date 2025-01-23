# Nutrient Document Generator - Vanilla JavaScript

## Intro

This is a working proof-of-concept app that aims to demonstrate the combined capabilities of Nutrient's Document Authoring and Web SDKs. It is meant as an inspiration for developers building document solutions.

## Features

In a nutshell, this is a step-by-step document generator that brings the user from a template to a PDF document, where they get to make modifications on every step of the way. Power and control to the user 💪.

Here are all the steps:
1) **Select Template**: user picks a document template from a list of DEMO templates (checklist, invoice, menu) which use predefined [DocJSON](https://www.nutrient.io/guides/document-authoring/working-with-documents/docjson/) templates or uploads a DOCX document;
![Step 1](./app/assets/step-1.png)
2) **Edit DocJSON Template**: user edits the template using the Document Authoring SDK;
![Step 2](./app/assets/step-2.png)
3) **Prepare JSON Data**: after either the DEMO data (based on the previously selected DEMO template) or an outline of a dataset is loaded, the user defines and fine tunes the data that will be used to populate the template;
![Step 3](./app/assets/step-3.png)
4) **Edit Generated DOCX**: after the template is populated with data using the Web SDK, the user edits the output document with the Document Authoring SDK;
![Step 4](./app/assets/step-4.png)
4) **Final PDF**: the final PDF is generated using the Document Authoring SDK and shown to the user with 100% fidelity between the previously edited DOCX and the PDF output - the user can then download the PDF.
![Step 5](./app/assets/step-5.png)

The user can go back and fourth between steps. The state is preserved, and the user can simply continue where they left off. The POC doesn't waste resources (see below re: destroying editors and viewers).

## Gettin Started

In order to run this POC on your local machine, you will require an up-to-date installation of Node.js. Download the contents of this entire folder, deploy it on your machine and run `npm install`.

The server is trivial and exists only to proxy access to the files required for the app to run.

To run the server - while in the folder where you deployed the POC - first configure the port in the _.env_ file:

```
PORT=8080
```

Then use the following command to run the server:

```
npm start
```

The POC will run at `localhost:<PORT>` and you can type it into your browser URL bar to access it.

## How It Works

### Dependencies

The Document Generator POC uses the following dependencies:
* [Picnic CSS](https://picnicss.com/): a minimalistic CSS framework, used for their [grid](https://picnicss.com/documentation#grid), as well as their [card](https://picnicss.com/documentation#card) and [input](https://picnicss.com/documentation#input) elements;
* [CodeMirror](https://codemirror.net/): a code editor, used for editing the JSON data used in document generation with syntax highlight;
* [Nutrient Web SDK](https://www.nutrient.io/sdk/web): the world's most developer friendly SDK for working with documents in JavaScript, used to generate DOCX based on a DOCX template and preview the resulting PDF;
* [Nutrient Document Authoring SDK](https://www.nutrient.io/sdk/document-authoring): the next generation plug-and-play document authoring SDK, used to create and edit DocJSON and DOCX templates, as well as to fine tune the outcome of DOCX generation.

You will find all dependencies included in _index.html_ in the `head` section via their respective CDN links, except Nutrient Web SDK which is deployed and served from the POC's backend.

### Architecture

These are the (really) relevant files:
* _app/index.html_: this is what _server.js_ serves when visited directly (there's an _index.html_ that redirects to this file) - contains the frontend;
* _app/index.js_: this is where all the magic happens.

Everything else is just assets and utility:
* _app/assets_: contains Nutrient logo and images for the DEMO templates;
* _app/styles.css_: contains some custom "let's make this look Nutrient" CSS;
* _templates_: contains the DEMO DocJSON template;
* _data_: contains the DEMO JSON data;
* _web-sdk_: this is where Nutrient Web SDK files will live after you run `npm install` (see Getting Started).

The POC is essentially a step-by-step wizard. The code is organized around these 5 steps to make it easy to focus on specific capabilities. That being said, every step is represented by the following:

#### 1️⃣ DOM Structure

Each step has its own "section" in _index.html_ and has a div with a class name that will be used to initialize an editor (DocJSON template, JSON, DOCX document) or a viewer (PDF). It also has one or more action buttons that come with the appropriate (and very verbose) `data-action` property.

For example, here's how step 4 looks like:
```
<section id="Step4_EditGeneratedDocx" data-initialized="no" class="none">
    <article class="card">
        <header>
        <h2>(4/5) Edit Generated DOCX</h2>
        </header>
        <div class="nutri-editor"></div>
        <footer>
        <div class="flex two">
            <div>
                <button class="nutri-button-dark" data-action="back-to-edit-data">← Edit Data</button>
            </div>  
            <div style="text-align: right;">
                <button class="nutri-button-dark" data-action="generate-pdf">Generate PDF →</button>
            </div>  
        </div>
        </footer>              
    </article>
</section>    
```

> [!NOTE]  
> The POC does have some minimal style overrides because we really like our Nutrient brand colors and you'll find them in `styles.css`.


#### 2️⃣ Transition

This is a step-by-step POC where the user can traverse steps by basically doing back and fourth. This is implemented by the means of `go<Section>()` functions, which ensure the transition from the current section to the desired section. The current section is whichever section is visible (the one that does not have `class="none"`, courtesy of Picnic CSS).

> [!NOTE]  
> There's a transition section which is used to "block" the screen during transition from one step to another, for which `startTransition(message)` and `endTransitionTo(section)` functions are used.

When one step transitions into another is where the magic happens - this is where we load, construct, deconstruct documents and render them into appropriate editors or viewers.

Here's an example of transitioning to the DOCX editor step (step 4), where we're fine tuning the generated DOCX, before converting it to a PDF:

```
function goDocxEditor() {  
  if(editGeneratedDocxSection.dataset.initialized === "no") { 
    initDocxEditor();
  }
  
  startTransition("Opening generated DOCX file...");

  const editorElement = editGeneratedDocxSection.getElementsByClassName('nutri-editor')[0];  
  (async () => {
    // get template & resolve to DOCX
    if(APP.docxDocument == null) {
      const templateBuffer = await APP.templateDocument.exportDOCX();
      const docxBuffer = await PSPDFKit.populateDocumentTemplate({ document: templateBuffer }, APP.dataJson);
      const docxDocument = await APP.docAuthSystem.importDOCX(docxBuffer);
      APP.docxDocument = docxDocument;
    }    
    
    // initialize editor
    const editor = await APP.docAuthSystem.createEditor(editorElement, { document: APP.docxDocument });
    APP.docxEditor = editor;

    // transition in
    endTransitionTo(editGeneratedDocxSection);    
  })();
}
```

After we've made sure that the screen is initialized, we:
* get the template document that we've previously edited as an array buffer  and export it as DOCX (courtesy of the Document Authoring SDK);
* generate the DOCX based on that template and the data we got from one of the previous steps (courtesy of the Web SDK);
* initialize the Document Authoring Editor and serve the previously generated DOCX document.


#### 3️⃣ Initialization

Each step is initialized only once, when the user transitions to it. This is ensured by managing the `data-initialized` property which has the value "yes" when initialized and "no" when not initialized, duh.

The initialization functions are named `init<Section>()` and they serve to define actions and attach them to action buttons, in a way which also ensures the destruction of unused editors and viewers.

Here's an example of how the template editor step (step 2) is initialized:

```
function initTemplateEditor() {
  const doButtonAction = e => {            
    const action = e.target.dataset.action;      
    APP.templateEditor.destroy();
    if(action == "back-to-template-selection") {            
      APP.templateDocument = null;
      goTemplatesSelection();
    } else if(action == "to-json-data") {
      goDataEditor();
    }
  };

  const buttons = editTemplateSection.getElementsByTagName('button');
  for (let button of buttons) {
    button.addEventListener("click", doButtonAction);
  }
  editTemplateSection.dataset.initialized = "yes";
}
```

It basically attaches a `doButtonAction` function to all buttons and then resolves each action based on what the button's `data-action` attribute (very verbosely) says. Let's dissect what happens:
* On "back-to-template-selection" we want to go back to the template selection step (step 1), which we do by calling `goTemplatesSelection()`;
* On "to-json-data" we want to move forward to edit JSON data (step 3) which we do by simply calling `goDataEditor()`.

But prior to any of these actions we will destroy the `templateEditor` and release browser resources that the Document Authoring SDK is using to render it. **Managing memory and unused DOM elements is important** when transitioning between different screens (err... steps) and this POC ensures it.

## Limitations

This POC is abysmally insensitive to errors. There's zero gracefulness in failing, if something fails, it will fail and the only way you'll know it failed is the browser Console.

There are no other limitations. Please feel free to take the POC, modify it in any way shape or form and use anywhere you want, as long as you respect the licensing terms for each dependency. Sky's the limit, or so they say.