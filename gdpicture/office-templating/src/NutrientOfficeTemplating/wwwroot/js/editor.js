/* ===========================================================================
 * A small JSON editor with syntax highlighting.
 *
 * Written rather than pulled in: the page ships no bundler and a strict CSP
 * rules out CDN scripts, so CodeMirror/Monaco aren't options. The approach is
 * the standard one — a transparent <textarea> layered over a <pre> that holds
 * the highlighted copy, scrolling in lockstep.
 * =========================================================================== */

const TOKEN =
  /("(?:\\.|[^"\\])*")(\s*:)?|(-?\d+\.?\d*(?:[eE][+-]?\d+)?)|\b(true|false|null)\b|([{}[\],])/g;

function escapeHtml(value) {
  return value.replace(
    /[&<>]/g,
    (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" })[ch],
  );
}

/** Wraps JSON tokens in classed spans. Falls back to plain text if anything looks off. */
function highlight(source) {
  return escapeHtml(source).replace(
    TOKEN,
    (match, str, colon, num, literal, punct) => {
      if (str !== undefined) {
        // A string followed by ':' is a key, not a value.
        const cls = colon ? "jk" : "js";
        return `<span class="${cls}">${str}</span>${colon ?? ""}`;
      }
      if (num !== undefined) return `<span class="jn">${num}</span>`;
      if (literal !== undefined) return `<span class="jl">${literal}</span>`;
      if (punct !== undefined) return `<span class="jp">${punct}</span>`;
      return match;
    },
  );
}

export class JsonEditor {
  /**
   * @param {HTMLElement} host element to build the editor inside
   * @param {(value: string) => void} onChange called on every edit
   */
  constructor(host, onChange) {
    host.classList.add("jed");
    host.innerHTML = `
      <pre class="jed-view" aria-hidden="true"><code></code></pre>
      <textarea class="jed-input" spellcheck="false" autocapitalize="off"
                autocomplete="off" wrap="off"></textarea>`;

    this.view = host.querySelector(".jed-view code");
    this.pre = host.querySelector(".jed-view");
    this.input = host.querySelector(".jed-input");
    this.onChange = onChange;

    this.input.addEventListener("input", () => this.#sync());
    this.input.addEventListener("scroll", () => this.#syncScroll());

    // Tab indents rather than leaving the editor — expected in a code field.
    this.input.addEventListener("keydown", (event) => {
      if (event.key !== "Tab") return;
      event.preventDefault();
      const { selectionStart: start, selectionEnd: end, value } = this.input;
      this.input.value = `${value.slice(0, start)}  ${value.slice(end)}`;
      this.input.selectionStart = this.input.selectionEnd = start + 2;
      this.#sync();
    });
  }

  get value() {
    return this.input.value;
  }

  set value(next) {
    this.input.value = next;
    this.#render();
  }

  /** Associates a label/description with the editable control. */
  setAria({ label, describedBy }) {
    if (label) this.input.setAttribute("aria-label", label);
    if (describedBy) this.input.setAttribute("aria-describedby", describedBy);
  }

  focus() {
    this.input.focus();
  }

  /** Moves the caret to a 1-based line/column and scrolls it into view. */
  goTo(line, column = 1) {
    const lines = this.input.value.split("\n");
    let offset = 0;
    for (let i = 0; i < Math.min(line - 1, lines.length); i += 1) {
      offset += lines[i].length + 1;
    }
    offset += Math.max(0, column - 1);

    this.input.focus();
    this.input.setSelectionRange(offset, offset);

    // Approximate the caret's y position and centre it.
    const lineHeight =
      Number.parseFloat(getComputedStyle(this.input).lineHeight) || 20;
    this.input.scrollTop = Math.max(
      0,
      (line - 1) * lineHeight - this.input.clientHeight / 2,
    );
    this.#syncScroll();
  }

  #sync() {
    this.#render();
    this.onChange?.(this.input.value);
  }

  #render() {
    // The trailing newline keeps the final line visible while scrolling.
    this.view.innerHTML = `${highlight(this.input.value)}\n`;
    this.#syncScroll();
  }

  #syncScroll() {
    this.pre.scrollTop = this.input.scrollTop;
    this.pre.scrollLeft = this.input.scrollLeft;
  }
}
