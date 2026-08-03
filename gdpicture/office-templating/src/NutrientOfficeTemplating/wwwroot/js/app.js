/* ===========================================================================
 * Office Templating demo — step-by-step wizard.
 *
 * State lives in one APP object so moving between steps never loses work, and
 * the current step + template are mirrored into the URL so any point in the
 * flow can be linked to.
 * =========================================================================== */

import { JsonEditor } from "./editor.js";
import * as viewer from "./viewer.js";

const TOTAL_STEPS = 6;

const APP = {
  templates: [],
  /** @type {?object} the chosen template (built-in or uploaded) */
  selected: null,
  /** placeholders read from the template itself */
  placeholders: [],
  /** the JSON being edited, kept across step changes */
  model: "",
  /** the pristine model, for Reset */
  pristineModel: "",
  /** @type {?object} last validation response */
  validation: null,
  /** @type {?object} last successful generation */
  generated: null,
  /** @type {?object} last successful PDF conversion */
  pdf: null,
  /** highest step the user has legitimately reached */
  step: 1,
  urls: [],
};

/** @type {?JsonEditor} */
let editor = null;

/* -------------------------------------------------------------------- utils */

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => Array.from(document.querySelectorAll(sel));

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function base64ToBlob(base64, contentType) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return new Blob([bytes], { type: contentType });
}

function objectUrl(blob) {
  const url = URL.createObjectURL(blob);
  APP.urls.push(url);
  return url;
}

function releaseUrls() {
  for (const url of APP.urls) {
    URL.revokeObjectURL(url);
  }
  APP.urls = [];
}

function escapeHtml(value) {
  return String(value).replace(
    /[&<>"']/g,
    (ch) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[ch],
  );
}

/** Reads {error} off a failed response without throwing on a non-JSON body. */
async function errorFrom(response, fallback) {
  try {
    const payload = await response.json();
    return Object.assign(new Error(payload.error ?? fallback), {
      detail: payload.status ? `${payload.step} — ${payload.status}` : null,
    });
  } catch {
    return new Error(fallback);
  }
}

/* ------------------------------------------------------------------ overlay */

function startTransition(message) {
  $("#overlay-text").textContent = message;
  $("#overlay").hidden = false;
}

function endTransition() {
  $("#overlay").hidden = true;
}

/* ------------------------------------------------------------------ routing */

/**
 * The URL is the source of truth for "where am I": ?template=<id>&step=<n>.
 * Written with replaceState during normal flow so Back leaves the app rather
 * than walking the wizard backwards one step at a time.
 */
function writeUrl({ push = false } = {}) {
  const params = new URLSearchParams();
  if (APP.selected) params.set("template", APP.selected.id);
  if (APP.step > 1) params.set("step", String(APP.step));

  const url = params.toString() ? `?${params}` : location.pathname;
  history[push ? "pushState" : "replaceState"]({ step: APP.step }, "", url);
}

function readUrl() {
  const params = new URLSearchParams(location.search);
  const step = Number(params.get("step"));
  return {
    template: params.get("template"),
    step: Number.isInteger(step) && step >= 1 && step <= TOTAL_STEPS ? step : 1,
  };
}

/* ---------------------------------------------------------------- stepping */

/**
 * How far the user is allowed to jump. Each gate is a real precondition, not
 * decoration: no template means nothing to show, invalid JSON means validation
 * would be meaningless, failed validation means generation would produce holes.
 */
function maxReachableStep() {
  if (!APP.selected) return 1;
  if (!isJsonValid(APP.model)) return 3;
  if (!APP.validation?.valid) return 4;
  if (!APP.generated) return 5;
  return TOTAL_STEPS;
}

function isJsonValid(text) {
  try {
    JSON.parse(text);
    return true;
  } catch {
    return false;
  }
}

function renderStepper() {
  const reachable = maxReachableStep();

  $$(".app-step").forEach((button) => {
    const n = Number(button.dataset.step);
    const locked = n > reachable;

    button.disabled = locked;
    button.classList.toggle("is-done", n < APP.step && !locked);
    if (n === APP.step) {
      button.setAttribute("aria-current", "step");
    } else {
      button.removeAttribute("aria-current");
    }
    button.title = locked ? lockReason(n) : `Go to step ${n}`;
  });

  $("#nav-prev").disabled = APP.step === 1;

  const next = $("#nav-next");
  next.disabled =
    APP.step >= TOTAL_STEPS || APP.step + 1 > reachable
      ? APP.step >= TOTAL_STEPS
      : false;
  next.textContent = NEXT_LABEL[APP.step] ?? "Next →";
  next.hidden = APP.step >= TOTAL_STEPS;

  // Preview is only meaningful once a template is chosen.
  $("#preview-template").hidden = !APP.selected;
}

const NEXT_LABEL = {
  1: "Placeholders →",
  2: "Edit data →",
  3: "Validate →",
  4: "Generate →",
  5: "Export PDF/UA →",
};

function lockReason(step) {
  if (!APP.selected) return "Pick a template first";
  if (step >= 4 && !isJsonValid(APP.model))
    return "The data model isn't valid JSON yet";
  if (step >= 5 && !APP.validation?.valid)
    return "Validation found errors that must be fixed";
  if (step >= 6 && !APP.generated) return "Generate the document first";
  return "";
}

function goStep(step, { push = false } = {}) {
  const target = Math.min(Math.max(step, 1), maxReachableStep());

  APP.step = target;
  $$(".app-section").forEach((section) => {
    section.hidden = section.id !== `step-${target}`;
  });

  renderStepper();
  writeUrl({ push });
  window.scrollTo({ top: 0, behavior: "smooth" });
}

/**
 * Advancing runs the work that step needs — validate before 4, generate before
 * 5, convert before 6 — so "Next" always means "do the next thing".
 */
async function advance() {
  switch (APP.step) {
    case 3:
      if (!(await validate())) return;
      goStep(4);
      return;
    case 4:
      if (!(await generate())) return;
      goStep(5);
      return;
    case 5:
      if (!(await convertToPdf())) return;
      goStep(6);
      return;
    default:
      goStep(APP.step + 1);
  }
}

/* ------------------------------------------------- step 1: template picker */

const FORMAT_INTENT = { DOCX: "info", XLSX: "positive", PPTX: "accent" };

/** What each format is for, shown once above its group. */
const FORMAT_BLURB = {
  DOCX: "Word documents — prose, clauses, and tables that reflow.",
  XLSX: "Excel workbooks — rows that grow, with cell types preserved.",
  PPTX: "PowerPoint decks — slides that repeat from a collection.",
};

function card(t) {
  return `
    <li>
      <button
        class="nk-card nk-card--interactive app-card-btn"
        data-template="${escapeHtml(t.id)}"
        type="button"
        aria-label="${escapeHtml(`${t.title} — ${t.format} template`)}"
      >
        <div class="nk-card-body">
          <span class="nk-badge nk-badge--${FORMAT_INTENT[t.format] ?? "muted"}">${escapeHtml(t.format)}</span>
          <h3 class="nk-title-card" style="margin-top:var(--space-6)">${escapeHtml(t.title)}</h3>
          <p class="nk-card-text">${escapeHtml(t.subtitle)}</p>
          <div class="nk-chips" style="margin-top:var(--space-7)">
            ${t.features.map((f) => `<span class="nk-tag">${escapeHtml(f)}</span>`).join("")}
          </div>
        </div>
      </button>
    </li>`;
}

/**
 * Grouped by format rather than one flat grid: the demo's whole argument is that one
 * API serves all three, and the counts make that visible at a glance.
 */
function renderTemplates() {
  const order = ["DOCX", "XLSX", "PPTX"];
  const groups = new Map(order.map((f) => [f, []]));

  for (const template of APP.templates) {
    if (!groups.has(template.format)) groups.set(template.format, []);
    groups.get(template.format).push(template);
  }

  $("#template-groups").innerHTML = [...groups]
    .filter(([, items]) => items.length > 0)
    .map(
      ([format, items]) => `
      <section class="app-group">
        <header class="app-group-head">
          <h3 class="nk-title-card">
            ${escapeHtml(format)}
            <span class="nk-count">${items.length}</span>
          </h3>
          <p class="nk-help">${escapeHtml(FORMAT_BLURB[format] ?? "")}</p>
        </header>
        <ul class="nk-grid">${items.map(card).join("")}</ul>
      </section>`,
    )
    .join("");

  $$("[data-template]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      // Picking a template is also the step-1 "next": go straight to its placeholders.
      if (await selectTemplate(btn.dataset.template)) {
        goStep(2, { push: true });
      }
    });
  });
}

/** Loads a template (built-in or uploaded) and resets everything downstream. */
async function selectTemplate(id, { silent = false } = {}) {
  // Re-picking the current template is a no-op, but still counts as success so the
  // caller advances rather than appearing to do nothing.
  if (APP.selected?.id === id) return true;

  if (!silent) startTransition("Loading the template…");

  try {
    const [info, model, placeholders] = await Promise.all([
      fetch(`/api/templates/${id}/info`).then(async (r) => {
        if (!r.ok)
          throw await errorFrom(r, "That template could not be found.");
        return r.json();
      }),
      fetch(`/api/templates/${id}/model`).then((r) => r.text()),
      fetch(`/api/templates/${id}/placeholders`).then((r) =>
        r.ok ? r.json() : [],
      ),
    ]);

    releaseUrls();
    APP.selected = info;
    APP.placeholders = placeholders;
    APP.model = model;
    APP.pristineModel = model;
    APP.validation = null;
    APP.generated = null;
    APP.pdf = null;

    renderPlaceholderStep();
    renderDataStep();
    return true;
  } catch (error) {
    if (!silent) window.alert(error.message);
    return false;
  } finally {
    if (!silent) endTransition();
  }
}

/* --------------------------------------------------------- step 1: uploads */

async function uploadTemplate(file) {
  $("#upload-error").innerHTML = "";
  startTransition(`Reading ${file.name}…`);

  try {
    const body = new FormData();
    body.append("template", file);

    const response = await fetch("/api/uploads", { method: "POST", body });
    if (!response.ok) throw await errorFrom(response, "That upload failed.");

    const payload = await response.json();

    // Adopt it exactly like a built-in template.
    releaseUrls();
    APP.selected = {
      id: payload.id,
      format: payload.format,
      title: payload.fileName,
      subtitle: `Uploaded template — ${payload.placeholders.length} placeholders found.`,
      features: ["Your template"],
      extension: payload.extension,
      uploaded: true,
    };
    APP.placeholders = payload.placeholders;
    APP.model = payload.model;
    APP.pristineModel = payload.model;
    APP.validation = null;
    APP.generated = null;
    APP.pdf = null;

    renderPlaceholderStep();
    renderDataStep();
    endTransition();
    goStep(2, { push: true });
  } catch (error) {
    endTransition();
    $("#upload-error").innerHTML = `
      <div class="app-error" style="margin-top:var(--space-8)">
        <strong>${escapeHtml(error.message)}</strong>
      </div>`;
  }
}

/* ------------------------------------------------ step 2: placeholder guide */

const SYNTAX = [
  ["{{field}}", "A single value substituted in place."],
  ["{{group.field}}", "A dotted path into a nested object."],
  [
    "{{#items}} … {{/items}}",
    "Repeats the enclosed block once per array entry — table rows, slides, list items.",
  ],
  ["{{^flag}} … {{/flag}}", "Renders only when the value is absent or false."],
  ["{{%image}}", "Inserts an image, configured by an object in the model."],
];

/**
 * Which image options each format actually honours. Determined by generating
 * documents and inspecting the OOXML — unsupported options are ignored
 * silently, so this table is the only way to know. See research/IMAGE-OPTIONS.md.
 */
const IMAGE_SUPPORT = {
  DOCX: {
    size: true,
    border: true,
    altText: true,
    rotation: true,
    link: true,
    caption: true,
  },
  XLSX: {
    size: true,
    border: true,
    altText: true,
    rotation: true,
    link: false,
    caption: false,
  },
  PPTX: {
    size: "clamped",
    border: true,
    altText: false,
    rotation: false,
    link: false,
    caption: false,
  },
};

const IMAGE_OPTIONS = [
  ["size", "width, height", "Pixel dimensions."],
  [
    "border",
    "borderColor, borderWidth, borderStyle",
    "Hex colour, pixel width, and Solid / Dash / Dot / DashDot / LargeDash.",
  ],
  [
    "altText",
    "altText, title",
    "Accessibility text — carried into the PDF/UA export.",
  ],
  ["rotation", "rotation", "Degrees, clockwise."],
  ["link", "link", "Absolute URL the image links to."],
  [
    "caption",
    "caption, captionLabel, captionPosition",
    "Caption text (placeholders allowed), with optional auto-numbering.",
  ],
];

const KIND_INTENT = {
  section: "warn",
  image: "accent",
  inverted: "info",
  value: "muted",
};

function renderPlaceholderStep() {
  const format = APP.selected.format;
  const support = IMAGE_SUPPORT[format] ?? {};

  // The markers actually present in the template.
  $("#template-placeholders").innerHTML = APP.placeholders.length
    ? APP.placeholders
        .map(
          (p) => `
          <li class="app-ph">
            <code class="app-ph-name">${escapeHtml(p.kind === "image" ? `{{%${p.name}}}` : `{{${p.name}}}`)}</code>
            <span class="nk-badge nk-badge--${KIND_INTENT[p.kind] ?? "muted"}">${escapeHtml(p.kind)}</span>
          </li>`,
        )
        .join("")
    : `<li class="nk-empty">No placeholders found in this template.</li>`;

  $("#syntax-legend").innerHTML = SYNTAX.map(
    ([code, desc]) => `
      <div class="app-syntax-item">
        <code class="app-syntax-code">${escapeHtml(code)}</code>
        <p class="app-syntax-desc">${escapeHtml(desc)}</p>
      </div>`,
  ).join("");

  const rows = IMAGE_OPTIONS.map(([key, keys, desc]) => {
    const state = support[key];
    const badge =
      state === true
        ? '<span class="nk-badge nk-badge--positive">supported</span>'
        : state === "clamped"
          ? '<span class="nk-badge nk-badge--warn">clamped to shape</span>'
          : '<span class="nk-badge nk-badge--muted">ignored</span>';
    return `
      <li class="app-ph">
        <span>
          <code class="app-ph-name">${escapeHtml(keys)}</code>
          <span class="app-syntax-desc" style="display:block;margin-top:var(--space-2)">${escapeHtml(desc)}</span>
        </span>
        ${badge}
      </li>`;
  }).join("");

  $("#image-support").innerHTML = `
    <h3 class="nk-title-card">Image options in ${escapeHtml(format)}</h3>
    <p class="nk-lede app-panel-lede">
      Options the engine ignores for this format are applied silently &mdash; no error is
      raised, so the difference only shows in the output.
    </p>
    <ul class="nk-list" style="margin-top:var(--space-8)">${rows}</ul>`;

  const link = $("#download-template");
  link.href = `/api/templates/${APP.selected.id}/file`;
  link.textContent = `Download empty template (.${APP.selected.extension})`;
}

/* ------------------------------------------------------- step 3: the model */

function describeJson(text) {
  try {
    JSON.parse(text);
    return { ok: true, message: "Valid JSON" };
  } catch (error) {
    // Surface the line/column so the caret can be sent there.
    const match = /at position (\d+)(?:.*line (\d+).*column (\d+))?/.exec(
      error.message,
    );
    const position = match ? Number(match[1]) : null;
    let line = match?.[2] ? Number(match[2]) : null;
    let column = match?.[3] ? Number(match[3]) : null;

    if (line === null && position !== null) {
      const upto = text.slice(0, position).split("\n");
      line = upto.length;
      column = upto[upto.length - 1].length + 1;
    }

    return { ok: false, message: error.message, line, column };
  }
}

function renderModelStatus() {
  const status = $("#model-status");
  const result = describeJson(APP.model);

  status.className = `nk-help ${result.ok ? "is-valid" : "is-invalid"}`;

  if (result.ok) {
    status.textContent = result.message;
  } else {
    status.innerHTML = result.line
      ? `${escapeHtml(result.message)} — <button class="nk-link" type="button" id="jump-to-error">go to line ${result.line}</button>`
      : escapeHtml(result.message);

    $("#jump-to-error")?.addEventListener("click", () => {
      editor.goTo(result.line, result.column ?? 1);
    });
  }

  return result.ok;
}

function renderDataStep() {
  if (!editor) return;
  editor.value = APP.model;
  renderModelStatus();
}

/* ---------------------------------------------------- step 4: validation */

async function validate() {
  if (!isJsonValid(APP.model)) {
    renderModelStatus();
    editor.focus();
    return false;
  }

  startTransition("Checking the data against the template…");

  try {
    const response = await fetch(`/api/templates/${APP.selected.id}/validate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model: APP.model }),
    });

    if (!response.ok) throw await errorFrom(response, "Validation failed.");

    APP.validation = await response.json();
    renderValidation();
    renderStepper();
    return true;
  } catch (error) {
    APP.validation = null;
    $("#validate-result").innerHTML = `
      <div class="app-error"><strong>${escapeHtml(error.message)}</strong></div>`;
    $("#validate-stats").innerHTML = "";
    return true; // still show step 4 so the error is visible
  } finally {
    endTransition();
  }
}

const STATE_BADGE = {
  ok: '<span class="nk-badge nk-badge--positive">ok</span>',
  missing: '<span class="nk-badge nk-badge--warn">no data</span>',
  invalid: '<span class="nk-badge nk-badge--accent">error</span>',
};

function renderValidation() {
  const { valid, error, warning, placeholders = [] } = APP.validation ?? {};

  // Errors block; missing data only warns.
  const counts = placeholders.reduce((acc, p) => {
    const state = p.state ?? (p.satisfied ? "ok" : "missing");
    acc[state] = (acc[state] ?? 0) + 1;
    return acc;
  }, {});

  $("#validate-stats").innerHTML = `
    <div class="nk-stat nk-stat--end">
      <span class="nk-stat-value">${counts.ok ?? 0}/${placeholders.length}</span>
      <span class="nk-stat-label">With data</span>
    </div>
    ${
      counts.invalid
        ? `<div class="nk-stat nk-stat--end">
           <span class="nk-stat-value nk-stat-value--accent">${counts.invalid}</span>
           <span class="nk-stat-label">Errors</span>
         </div>`
        : ""
    }`;

  const rows = placeholders
    .map((p) => {
      const state = p.state ?? (p.satisfied ? "ok" : "missing");
      return `
      <li class="app-ph">
        <span>
          <code class="app-ph-name">${escapeHtml(p.name)}</code>
          ${
            p.detail && state !== "ok"
              ? `<span class="app-syntax-desc" style="display:block;margin-top:var(--space-2)">${escapeHtml(p.detail)}</span>`
              : ""
          }
        </span>
        <span class="nk-row-flex" style="gap:var(--space-4)">
          <span class="nk-badge nk-badge--${KIND_INTENT[p.kind] ?? "muted"}">${escapeHtml(p.kind)}</span>
          ${STATE_BADGE[state] ?? STATE_BADGE.missing}
        </span>
      </li>`;
    })
    .join("");

  // Errors take precedence in the banner; a warning still permits generating.
  let banner;
  if (!valid) {
    banner = `
      <div class="app-error">
        <strong>${escapeHtml(error ?? "Validation failed.")}</strong>
        <div class="app-error-detail">
          These must be fixed at step 3 — generating would fail or produce a broken document.
        </div>
      </div>`;
  } else if (warning) {
    banner = `
      <div class="app-warn">
        <strong>${escapeHtml(warning)}</strong>
        <div class="app-error-detail">
          You can generate anyway &mdash; those placeholders will simply resolve to nothing.
        </div>
      </div>`;
  } else {
    banner = `
      <div class="app-ok">
        <strong>All ${placeholders.length} placeholders have data.</strong> Ready to generate.
      </div>`;
  }

  $("#validate-result").innerHTML =
    `${banner}<ul class="nk-list app-ph-grid" style="margin-top:var(--space-9)">${rows}</ul>`;
}

/* ---------------------------------------------------- step 5: generation */

async function generate() {
  if (!APP.validation?.valid) return false;

  releaseUrls();
  APP.pdf = null;
  startTransition(`Generating the ${APP.selected.format} document…`);

  try {
    const response = await fetch(`/api/templates/${APP.selected.id}/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model: APP.model, includePdf: false }),
    });

    if (!response.ok) throw await errorFrom(response, "Generation failed.");

    APP.generated = await response.json();
    renderGenerated();
    renderStepper();
    return true;
  } catch (error) {
    renderError("#generate-result", error);
    $("#generate-summary").textContent = "";
    $("#generate-stats").innerHTML = "";
    return true;
  } finally {
    endTransition();
  }
}

function renderGenerated() {
  const {
    document: base64,
    documentName,
    contentType,
    elapsedMs,
  } = APP.generated;
  const blob = base64ToBlob(base64, contentType);
  const url = objectUrl(blob);

  $("#generate-summary").textContent =
    `${APP.selected.title} — placeholders resolved, loops expanded, formatting preserved.`;

  $("#generate-stats").innerHTML = `
    <div class="nk-stat nk-stat--end">
      <span class="nk-stat-value nk-stat-value--accent">${elapsedMs}<span style="font-size:var(--text-md)">ms</span></span>
      <span class="nk-stat-label">Generation</span>
    </div>`;

  $("#generate-result").innerHTML = `
    <div class="app-file">
      <div class="app-file-meta">
        <span class="nk-badge nk-badge--${FORMAT_INTENT[APP.selected.format] ?? "muted"}">${escapeHtml(APP.selected.format)}</span>
        <span class="app-file-name">${escapeHtml(documentName)}</span>
        <span class="app-file-size">${formatBytes(blob.size)}</span>
      </div>
      <a class="nk-btn" href="${url}" download="${escapeHtml(documentName)}">Download</a>
    </div>
    <p class="nk-help">
      Office documents can't render in the browser &mdash; download it, or continue to
      the PDF/UA export for an inline preview.
    </p>`;
}

/* -------------------------------------------------------- step 6: PDF/UA */

async function convertToPdf() {
  startTransition("Converting to PDF/UA…");

  try {
    const response = await fetch(`/api/templates/${APP.selected.id}/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model: APP.model, includePdf: true }),
    });

    if (!response.ok) throw await errorFrom(response, "Conversion failed.");

    APP.pdf = await response.json();
    renderPdf();
    renderStepper();
    return true;
  } catch (error) {
    renderError("#pdf-result", error);
    $("#pdf-stats").innerHTML = "";
    return true;
  } finally {
    endTransition();
  }
}

async function renderPdf() {
  const { pdf, pdfName, elapsedMs } = APP.pdf;
  const blob = base64ToBlob(pdf, "application/pdf");
  const url = objectUrl(blob);

  $("#pdf-stats").innerHTML = `
    <div class="nk-stat nk-stat--end">
      <span class="nk-stat-value nk-stat-value--accent">${elapsedMs}<span style="font-size:var(--text-md)">ms</span></span>
      <span class="nk-stat-label">Generate + convert</span>
    </div>
    <div class="nk-stat nk-stat--end">
      <span class="nk-stat-value">PDF/UA-1</span>
      <span class="nk-stat-label">Conformance</span>
    </div>`;

  $("#pdf-result").innerHTML = `
    <div class="app-file">
      <div class="app-file-meta">
        <span class="nk-badge nk-badge--positive">PDF</span>
        <span class="app-file-name">${escapeHtml(pdfName)}</span>
        <span class="app-file-size">${formatBytes(blob.size)}</span>
      </div>
      <a class="nk-btn nk-btn--primary" href="${url}" download="${escapeHtml(pdfName)}">Download</a>
    </div>
    <div class="app-viewer" id="pdf-viewer"></div>`;

  // The viewer wants the bytes, not a URL — and this way the same buffer backs both
  // the download link and the on-screen render.
  try {
    await viewer.showPdf($("#pdf-viewer"), await blob.arrayBuffer());
  } catch (error) {
    $("#pdf-viewer").innerHTML = `
      <div class="app-warn">
        <strong>The inline viewer could not start.</strong>
        <div class="app-error-detail">${escapeHtml(error.message)}</div>
        <div class="app-error-detail">The PDF above still downloads normally.</div>
      </div>`;
  }
}

/* ---------------------------------------------------------------- preview */

/** Renders the unfilled template to PDF in a drawer, available at any step. */
async function previewTemplate() {
  if (!APP.selected) return;

  startTransition("Rendering the template…");

  try {
    const response = await fetch(`/api/templates/${APP.selected.id}/preview`);
    if (!response.ok)
      throw await errorFrom(response, "The preview could not be rendered.");

    const pdf = await response.arrayBuffer();

    $("#preview-title").textContent = `${APP.selected.title} — template`;
    $("#preview-sub").textContent =
      "The unfilled template, rendered to PDF. Placeholders are still visible.";
    $("#preview-body").innerHTML =
      `<div class="app-viewer app-viewer--tall" id="preview-viewer"></div>`;
    $("#preview-drawer").hidden = false;

    // Mounted after the drawer is visible: the viewer measures its container, and a
    // hidden element has no height to measure.
    await viewer.showPdf($("#preview-viewer"), pdf);
  } catch (error) {
    $("#preview-title").textContent = "Preview";
    $("#preview-sub").textContent = "";
    $("#preview-body").innerHTML =
      `<div class="app-error"><strong>${escapeHtml(error.message)}</strong></div>`;
    $("#preview-drawer").hidden = false;
  } finally {
    endTransition();
  }
}

function closePreview() {
  $("#preview-drawer").hidden = true;
  // Unload before emptying the container — the SDK holds a WASM instance and its own
  // DOM, and dropping the element without telling it leaks both.
  viewer.unload().finally(() => {
    $("#preview-body").innerHTML = "";
  });
}

/* ---------------------------------------------------------------- errors */

function renderError(target, error) {
  $(target).innerHTML = `
    <div class="app-error">
      <strong>${escapeHtml(error.message)}</strong>
      ${error.detail ? `<div class="app-error-detail">${escapeHtml(error.detail)}</div>` : ""}
    </div>`;
}

/* ------------------------------------------------------------------ wiring */

function wireEvents() {
  // Clickable stepper.
  $$(".app-step").forEach((button) => {
    button.addEventListener("click", () =>
      goStep(Number(button.dataset.step), { push: true }),
    );
  });

  $("#nav-prev").addEventListener("click", () =>
    goStep(APP.step - 1, { push: true }),
  );
  $("#nav-next").addEventListener("click", advance);

  $("#preview-template").addEventListener("click", previewTemplate);
  $("#preview-close").addEventListener("click", closePreview);
  $("#preview-drawer").addEventListener("click", (event) => {
    if (event.target === $("#preview-drawer")) closePreview();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !$("#preview-drawer").hidden) closePreview();
  });

  $("#reset-model").addEventListener("click", () => {
    APP.model = APP.pristineModel;
    APP.validation = null;
    renderDataStep();
    renderStepper();
  });

  // Upload: browse, and drag-and-drop.
  const dropzone = $("#dropzone");
  const fileInput = $("#file-input");

  $("#browse").addEventListener("click", () => fileInput.click());
  fileInput.addEventListener("change", () => {
    if (fileInput.files?.[0]) uploadTemplate(fileInput.files[0]);
    fileInput.value = "";
  });

  ["dragenter", "dragover"].forEach((type) => {
    dropzone.addEventListener(type, (event) => {
      event.preventDefault();
      dropzone.classList.add("is-over");
    });
  });
  ["dragleave", "drop"].forEach((type) => {
    dropzone.addEventListener(type, (event) => {
      event.preventDefault();
      if (type === "dragleave" && dropzone.contains(event.relatedTarget))
        return;
      dropzone.classList.remove("is-over");
    });
  });
  dropzone.addEventListener("drop", (event) => {
    const file = event.dataTransfer?.files?.[0];
    if (file) uploadTemplate(file);
  });

  // Back/forward through wizard steps.
  window.addEventListener("popstate", () => {
    const { template, step } = readUrl();
    if (template && template !== APP.selected?.id) {
      selectTemplate(template).then(() => goStep(step));
    } else {
      goStep(step);
    }
  });
}

async function init() {
  editor = new JsonEditor($("#model-editor"), (value) => {
    APP.model = value;
    // Editing invalidates any previous verdict.
    APP.validation = null;
    renderModelStatus();
    renderStepper();
  });
  editor.setAria({ label: "JSON data model", describedBy: "model-status" });

  wireEvents();

  try {
    const response = await fetch("/api/templates");
    if (!response.ok)
      throw new Error(`Could not load templates (${response.status}).`);
    APP.templates = await response.json();
    renderTemplates();
  } catch (error) {
    $("#template-groups").innerHTML =
      `<div class="app-error"><strong>${escapeHtml(error.message)}</strong></div>`;
  }

  // Rehydrate from the URL so a permalink lands where it says it does.
  const { template, step } = readUrl();
  if (template) {
    const ok = await selectTemplate(template, { silent: true });
    if (!ok) {
      // A stale link — most likely an expired upload.
      $("#upload-error").innerHTML = `
        <div class="app-error" style="margin-top:var(--space-8)">
          <strong>That template link is no longer valid.</strong>
          <div class="app-error-detail">Uploaded templates are kept for 30 minutes. Pick one below or upload again.</div>
        </div>`;
      goStep(1);
      return;
    }
  }

  goStep(step);
}

init();
