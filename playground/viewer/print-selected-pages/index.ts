import type { Instance } from "@nutrient-sdk/viewer";
import { baseOptions } from "../../shared/base-options";

window.NutrientViewer.load({
  ...baseOptions,
  theme: window.NutrientViewer.Theme.DARK,
}).then((instance: Instance) => {
  const panel = document.createElement("div");
  panel.style.cssText =
    "position:fixed;top:10px;right:10px;z-index:99999;background:#2d2d2d;color:#e0e0e0;padding:12px;border:1px solid #555;border-radius:8px;font:12px system-ui;max-width:280px";
  panel.innerHTML = `
  <div style="font-weight:600;margin-bottom:8px">Print selected pages</div>
  <button id="btn-print-current" style="width:100%;padding:8px;margin-bottom:8px;background:#007aff;color:#fff;border:0;border-radius:4px;cursor:pointer">Print current page</button>
  <input id="inp-range" placeholder="e.g. 1,3-5,8" style="width:100%;box-sizing:border-box;padding:7px;border-radius:4px;border:1px solid #555;background:#1a1a1a;color:#e0e0e0;margin-bottom:6px" />
  <button id="btn-print-range" style="width:100%;padding:8px;margin-bottom:8px;background:#34c759;color:#fff;border:0;border-radius:4px;cursor:pointer">Print selected pages</button>
  <label style="display:block;margin-bottom:4px"><input type="radio" name="m" value="tab" checked /> New tab</label>
  <label style="display:block;margin-bottom:8px"><input type="radio" name="m" value="iframe" /> Iframe auto-print (best effort)</label>
  <div id="log" style="background:#1a1a1a;border-radius:4px;padding:8px;font:11px ui-monospace, SFMono-Regular, Menlo, monospace;max-height:140px;overflow:auto;color:#aaa"></div>
`;
  document.body.appendChild(panel);

  const logEl = panel.querySelector("#log") as HTMLElement;
  const log = (msg: string, level: "info" | "error" | "success" = "info") => {
    const c =
      level === "error"
        ? "#ff3b30"
        : level === "success"
          ? "#34c759"
          : "#4aa3ff";
    const line = document.createElement("div");
    line.style.color = c;
    line.textContent = `[${new Date().toLocaleTimeString()}] ${msg}`;
    logEl.appendChild(line);
    logEl.scrollTop = logEl.scrollHeight;
    console.log("[PrintPages]", msg);
  };

  async function getTotalPages(): Promise<number> {
    if (typeof instance.totalPageCount === "number")
      return instance.totalPageCount;
    if (
      instance.document &&
      typeof instance.document.getPageCount === "function"
    )
      return await instance.document.getPageCount();
    throw new Error("Unable to determine page count from SDK instance.");
  }

  function parseRange(str: string, totalPages: number): number[] {
    const parts = str
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const set = new Set<number>();

    for (const part of parts) {
      if (part.includes("-")) {
        const [a, b] = part
          .split("-")
          .map((s) => Number.parseInt(s.trim(), 10));
        if (!Number.isInteger(a) || !Number.isInteger(b))
          throw new Error(`Invalid range: "${part}"`);
        if (a > b) throw new Error(`Invalid range (start > end): "${part}"`);
        for (let p = a; p <= b; p++) {
          if (p < 1 || p > totalPages)
            throw new Error(`Page ${p} out of bounds (1-${totalPages})`);
          set.add(p - 1);
        }
      } else {
        const p = Number.parseInt(part, 10);
        if (!Number.isInteger(p)) throw new Error(`Invalid page: "${part}"`);
        if (p < 1 || p > totalPages)
          throw new Error(`Page ${p} out of bounds (1-${totalPages})`);
        set.add(p - 1);
      }
    }

    return Array.from(set).sort((x, y) => x - y);
  }

  async function exportSubset(pageIndexes: number[]): Promise<ArrayBuffer> {
    log(
      `Exporting pages (1-based): ${pageIndexes.map((i) => i + 1).join(", ")}`,
    );
    const buf = await instance.exportPDFWithOperations([
      { type: "keepPages", pageIndexes },
    ]);
    log(`Export complete (${Math.round(buf.byteLength / 1024)} KB)`, "success");
    return buf;
  }

  function printNewTabWithPopupSafeNavigation(
    buf: ArrayBuffer,
    preOpenedWindow: Window | null,
  ): void {
    const blob = new Blob([buf], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);

    // If we successfully opened a window synchronously, navigate it now.
    if (preOpenedWindow && !preOpenedWindow.closed) {
      preOpenedWindow.location.href = url;
      log("Opened subset PDF in the pre-opened tab.", "success");
    } else {
      // Fallback attempt (may be blocked depending on browser)
      const w = window.open(url, "_blank", "noopener,noreferrer");
      if (!w) {
        log(
          "Popup blocked. Please allow popups, or switch to iframe method.",
          "error",
        );
      } else {
        log("Opened subset PDF in a new tab.", "success");
      }
    }

    // Conservative cleanup: do not revoke quickly.
    setTimeout(() => {
      try {
        URL.revokeObjectURL(url);
      } catch (_) {}
      log("Blob URL revoked (cleanup).");
    }, 120000);
  }

  function printViaIframe(buf: ArrayBuffer): void {
    const blob = new Blob([buf], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);

    const iframe = document.createElement("iframe");
    iframe.style.cssText =
      "position:fixed;left:-9999px;top:0;width:1px;height:1px;border:0";
    iframe.src = url;

    const cleanup = () => {
      setTimeout(() => {
        try {
          URL.revokeObjectURL(url);
        } catch (_) {}
        try {
          iframe.remove();
        } catch (_) {}
        log("Iframe cleaned up.");
      }, 120000);
    };

    iframe.onload = () => {
      log("PDF loaded in iframe. Trying print()...");
      try {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
        log("Print dialog triggered (iframe).", "success");
      } catch (e) {
        log(`Iframe print failed: ${(e as Error)?.message || e}`, "error");
      } finally {
        cleanup();
      }
    };

    iframe.onerror = () => {
      log("Iframe failed to load PDF.", "error");
      cleanup();
    };

    document.body.appendChild(iframe);
  }

  async function runPrint(
    pageIndexes: number[],
    clickEvent: MouseEvent,
  ): Promise<void> {
    // Determine method and pre-open tab synchronously if needed (avoids popup blockers)
    const method = panel.querySelector<HTMLInputElement>(
      'input[name="m"]:checked',
    )?.value;

    let preOpenedWindow: Window | null = null;
    if (method === "tab") {
      // Must happen synchronously during the click handler call stack
      preOpenedWindow = window.open("about:blank", "_blank");
      if (!preOpenedWindow)
        log(
          "Popup blocked when opening blank tab. Will try direct open later.",
          "error",
        );
    }

    try {
      const buf = await exportSubset(pageIndexes);
      if (method === "tab") {
        printNewTabWithPopupSafeNavigation(buf, preOpenedWindow);
      } else {
        printViaIframe(buf);
      }
    } catch (e) {
      log((e as Error)?.message || String(e), "error");
      try {
        if (preOpenedWindow && !preOpenedWindow.closed) preOpenedWindow.close();
      } catch (_) {}
    }
  }

  // Wire buttons
  panel
    .querySelector("#btn-print-current")
    ?.addEventListener("click", async (ev) => {
      const idx = instance.viewState?.currentPageIndex;
      if (typeof idx !== "number")
        return log("Could not read currentPageIndex from viewState.", "error");
      await runPrint([idx], ev as MouseEvent);
    });

  panel
    .querySelector("#btn-print-range")
    ?.addEventListener("click", async (ev) => {
      const input = (
        panel.querySelector("#inp-range") as HTMLInputElement
      )?.value.trim();
      if (!input) return log("Enter a page list, e.g. 1,3-5,8", "error");

      const total = await getTotalPages();
      const indexes = parseRange(input, total);
      if (!indexes.length)
        return log("No pages selected after parsing.", "error");
      await runPrint(indexes, ev as MouseEvent);
    });

  log("Print controls ready.", "success");
});
