/* ===========================================================================
 * PDF preview via the Nutrient Web SDK.
 *
 * Replaces the browser's built-in PDF plugin, which gave no control over
 * appearance and rendered as a blank frame in some environments. The SDK is
 * loaded on demand — it pulls a WASM core, so it shouldn't be paid for until a
 * preview is actually opened.
 * =========================================================================== */

/** Where copy-web-sdk.mjs puts the distributable. */
const SDK_SCRIPT = "/vendor/nutrient/nutrient-viewer.js";
const SDK_BASE_URL = `${location.origin}/vendor/nutrient/`;

let sdkPromise = null;
let config = null;

/** Loads the front-end config once — currently just the licence key. */
async function loadConfig() {
  if (config) return config;

  try {
    const response = await fetch("/api/config");
    config = response.ok ? await response.json() : {};
  } catch {
    // A missing config shouldn't break the viewer; it just runs in trial mode.
    config = {};
  }

  return config;
}

/**
 * Injects the SDK script once and resolves with the global it defines.
 *
 * The package ships a plain script rather than an ES module, so it's added as a
 * <script> tag and read off window rather than imported.
 */
function loadSdk() {
  if (sdkPromise) return sdkPromise;

  sdkPromise = new Promise((resolve, reject) => {
    if (window.NutrientViewer) {
      resolve(window.NutrientViewer);
      return;
    }

    const script = document.createElement("script");
    script.src = SDK_SCRIPT;
    script.async = true;

    script.addEventListener("load", () => {
      if (window.NutrientViewer) {
        resolve(window.NutrientViewer);
      } else {
        reject(new Error("The Nutrient Web SDK loaded but exposed no viewer."));
      }
    });

    script.addEventListener("error", () => {
      // Almost always the assets not being present — npm install runs the copy step.
      sdkPromise = null;
      reject(
        new Error(
          "Could not load the Nutrient Web SDK from /vendor/nutrient/. " +
            "Run `npm install` to fetch it.",
        ),
      );
    });

    document.head.append(script);
  });

  return sdkPromise;
}

/** Tracks the live instance so it can be torn down before the next load. */
let current = null;

/**
 * Renders a PDF into a container.
 *
 * @param {HTMLElement} container where to mount
 * @param {ArrayBuffer} pdf the document bytes
 * @param {{toolbar?: boolean}} [options]
 */
export async function showPdf(container, pdf, options = {}) {
  const [NutrientViewer, settings] = await Promise.all([
    loadSdk(),
    loadConfig(),
  ]);

  await unload();

  // The kit is dark-mode-first, so the viewer follows the page's theme rather
  // than defaulting to light chrome inside a dark panel.
  const dark = document.documentElement.dataset.theme !== "light";

  const configuration = {
    container,
    document: pdf,
    baseUrl: SDK_BASE_URL,
    theme: dark ? NutrientViewer.Theme.DARK : NutrientViewer.Theme.LIGHT,
    styleSheets: ["/css/viewer-theme.css"],
  };

  // Omitted entirely when absent — an empty string is not the same as no key.
  if (settings.webSdkLicenseKey) {
    configuration.licenseKey = settings.webSdkLicenseKey;
  }

  if (options.toolbar === false) {
    configuration.toolbarItems = [];
  }

  current = { NutrientViewer, container };
  const instance = await NutrientViewer.load(configuration);
  current.instance = instance;

  return instance;
}

/** Tears down the live instance. Safe to call when nothing is mounted. */
export async function unload() {
  if (!current) return;

  const { NutrientViewer, container } = current;
  current = null;

  try {
    NutrientViewer.unload(container);
  } catch {
    // Already gone — nothing to do.
  }
}

/** Whether a licence key is configured, for the UI to explain trial watermarks. */
export async function isTrialMode() {
  const settings = await loadConfig();
  return Boolean(settings.webSdkTrialMode);
}
