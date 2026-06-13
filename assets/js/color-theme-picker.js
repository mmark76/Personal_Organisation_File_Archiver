/* User-controlled settings panel for essential appearance and readability options. */

window.ColorThemePicker = (() => {
  const storageKey = "organizeYourPcColorTheme";
  const fontOptions = [
    ["Segoe UI, Roboto, Arial, sans-serif", "Segoe UI"],
    ["Arial, Helvetica, sans-serif", "Arial"],
    ["Roboto, Arial, sans-serif", "Roboto"],
    ["Verdana, Geneva, sans-serif", "Verdana"],
    ["Georgia, serif", "Georgia"],
    ["Trebuchet MS, Arial, sans-serif", "Trebuchet"],
    ["Segoe UI Mono, Consolas, monospace", "Monospace"]
  ];

  const sections = [
    {
      title: "Essential colors",
      fields: [
        { key: "appBg", label: "Page background", type: "color", value: "#000000", css: "--app-bg" },
        { key: "appSurface", label: "Main surface", type: "color", value: "#0A0A0A", css: "--app-surface" },
        { key: "appText", label: "Main text", type: "color", value: "#FFFFFF", css: "--app-text" },
        { key: "appMuted", label: "Muted text", type: "color", value: "#FFFFFF", css: "--app-muted" },
        { key: "appPrimary", label: "Primary button", type: "color", value: "#6B7280", css: "--app-primary" },
        { key: "appFocus", label: "Focus outline", type: "color", value: "#2563EB", css: "--app-focus" },
        { key: "archiveDestinationBorder", label: "Archive selection border", type: "color", value: "#FFFFFF", css: "--archive-destination-border" },
        { key: "inputBorder", label: "Input field border", type: "color", value: "#404040", css: "--input-border" }
      ]
    },
    {
      title: "Size and readability",
      fields: [
        { key: "buttonHeight", label: "Button height", type: "number", value: 28, min: 28, max: 54 },
        { key: "bodyFontSize", label: "Body text size", type: "number", value: 11, min: 11, max: 18 },
        { key: "buttonFontSize", label: "Button text size", type: "number", value: 13, min: 11, max: 18 },
        { key: "choiceTextFontSize", label: "Choice text size", type: "number", value: 11, min: 11, max: 18 },
        { key: "treeFontSize", label: "Tree/code text size", type: "number", value: 11, min: 10, max: 16 }
      ]
    },
    {
      title: "Font",
      fields: [
        { key: "appFont", label: "Main font", type: "font", value: "Trebuchet MS, Arial, sans-serif" }
      ]
    }
  ];

  const fields = sections.flatMap(section => section.fields);
  const defaults = Object.fromEntries(fields.map(field => [field.key, field.value]));
  let isOpen = false;

  function element(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function safeValue(field, value) {
    if (field.type === "color") {
      const normalized = String(value || "").trim().toUpperCase();
      return /^#[0-9A-F]{6}$/.test(normalized) ? normalized : field.value;
    }

    if (field.type === "number") {
      const number = Number(value);
      return Number.isFinite(number)
        ? Math.min(field.max, Math.max(field.min, Math.round(number)))
        : field.value;
    }

    return fontOptions.some(([font]) => font === value) ? value : field.value;
  }

  function safeTheme(theme) {
    const source = theme && typeof theme === "object" ? theme : {};
    return Object.fromEntries(fields.map(field => [field.key, safeValue(field, source[field.key])]));
  }

  function loadTheme() {
    try {
      const stored = localStorage.getItem(storageKey);
      return safeTheme(stored ? JSON.parse(stored) : defaults);
    } catch (error) {
      return { ...defaults };
    }
  }

  function saveTheme(theme) {
    localStorage.setItem(storageKey, JSON.stringify(safeTheme(theme)));
  }

  function applyTheme(theme) {
    const current = safeTheme(theme);
    const root = document.documentElement.style;

    fields.filter(field => field.css).forEach(field => root.setProperty(field.css, current[field.key]));
    root.setProperty("--app-font", current.appFont);
    root.setProperty("--app-muted-strong", current.appMuted);

    let style = document.getElementById("colorThemePickerGeneratedStyles");
    if (!style) {
      style = element("style");
      style.id = "colorThemePickerGeneratedStyles";
      document.head.appendChild(style);
    }

    style.textContent = `
      .app-intro, .screen-card p, .work-panel p, .guidance-card span,
      .small-note, .file-status-box, .advisor-suggestion-box,
      .archive-result-box, .examples-box, .fixed-type {
        font-size: ${current.bodyFontSize}px;
      }
      .button, button, .button-secondary, .button-success, .button-danger {
        min-height: ${current.buttonHeight}px;
        font-size: ${current.buttonFontSize}px;
      }
      .header-actions .button {
        min-height: ${Math.max(30, Math.round(current.buttonHeight * 0.94))}px;
        font-size: ${Math.max(11, current.buttonFontSize - 1)}px;
      }
      .choice-card span { font-size: ${current.choiceTextFontSize}px; }
      .structure-output, .folder-tree-preview, .folder-display-code {
        font-size: ${current.treeFontSize}px;
      }
    `;
  }

  function injectStyles() {
    if (document.getElementById("colorThemePickerStyles")) return;
    const style = element("style");
    style.id = "colorThemePickerStyles";
    style.textContent = `
      #colorThemePickerModal {
        position: fixed; top: 24px; right: 18px; z-index: 1000;
        width: min(420px, calc(100vw - 24px)); padding: 0;
        background: transparent; pointer-events: none;
      }
      #colorThemePickerModal[hidden] { display: none !important; }
      .ctp-card {
        width: 100%; max-height: calc(100vh - 48px); overflow: auto;
        padding: 16px; border: 1px solid var(--color-modal-border, #404040);
        border-radius: 18px; background: #060606;
        box-shadow: 0 18px 56px rgba(0, 0, 0, 0.62);
        color: var(--app-text); pointer-events: auto;
      }
      .ctp-header {
        display: flex; align-items: flex-start; justify-content: space-between;
        gap: 12px; margin-bottom: 8px;
      }
      .ctp-header h2 { margin: 0; font-size: 19px; line-height: 1.2; color: #fff; }
      .ctp-close {
        width: 34px; min-width: 34px; height: 34px; min-height: 34px;
        padding: 0; border: 1px solid var(--color-modal-border, #404040);
        border-radius: 10px; background: transparent; color: #fff;
        font-size: 21px; line-height: 1;
      }
      .ctp-close:hover { background: rgba(255, 255, 255, 0.08); color: #fff; }
      .ctp-intro {
        margin: 4px 0 12px; color: rgba(255, 255, 255, 0.82);
        font-size: 12px; line-height: 1.4;
      }
      .ctp-grid { display: grid; gap: 7px; }
      .ctp-section-title {
        margin: 12px 0 7px; padding-top: 9px;
        border-top: 1px solid rgba(255, 255, 255, 0.08);
        color: rgba(255, 255, 255, 0.92); font-size: 11px;
        font-weight: 850; letter-spacing: 0.08em; text-transform: uppercase;
      }
      .ctp-section-title:first-child { margin-top: 0; padding-top: 0; border-top: 0; }
      .ctp-row, .ctp-size-row, .ctp-font-row {
        display: grid; align-items: center; gap: 8px; padding: 8px 9px;
        border: 1px solid var(--color-modal-border, #404040);
        border-radius: 12px; background: rgba(255, 255, 255, 0.025);
      }
      .ctp-row { grid-template-columns: minmax(130px, 1fr) 40px 78px; }
      .ctp-size-row { grid-template-columns: minmax(112px, 1fr) minmax(86px, 120px) 58px; }
      .ctp-font-row { grid-template-columns: minmax(112px, 1fr) minmax(150px, 1.2fr); }
      .ctp-label { margin: 0; color: #fff; font-size: 12px; font-weight: 700; }
      .ctp-swatch {
        width: 34px; height: 26px; padding: 0;
        border: 1px solid var(--color-modal-border, #404040);
        border-radius: 8px; background: transparent; cursor: pointer;
      }
      .ctp-hex, .ctp-size-value, .ctp-font-select {
        border: 1px solid var(--color-modal-border, #404040);
        border-radius: 8px; background: #0d0d0d; color: #fff;
        font-size: 11px; font-weight: 700; text-align: center;
      }
      .ctp-hex { width: 78px; min-width: 78px; padding: 6px 7px; text-transform: uppercase; }
      .ctp-size-value { width: 58px; min-width: 58px; padding: 6px 5px; }
      .ctp-size-range {
        width: 100%; padding: 0; border: 0; background: transparent;
        accent-color: var(--app-primary-hover);
      }
      .ctp-font-select { width: 100%; padding: 6px 7px; }
      .ctp-actions {
        display: grid; grid-template-columns: 1fr 1fr;
        gap: 8px; margin-top: 12px;
      }
      .ctp-actions .button, .ctp-actions button {
        min-height: 34px; padding: 7px 9px; font-size: 12px;
      }
      .ctp-actions .ctp-save-button { grid-column: 1 / -1; }
      @media (max-width: 720px) {
        #colorThemePickerModal {
          top: 12px; right: 12px; bottom: auto;
          width: min(360px, calc(100vw - 24px));
        }
        .ctp-card { max-height: calc(100vh - 24px); }
      }
    `;
    document.head.appendChild(style);
  }

  function createField(field) {
    const className = field.type === "color" ? "ctp-row" : field.type === "font" ? "ctp-font-row" : "ctp-size-row";
    const row = element("div", className);
    const label = element("label", "ctp-label", field.label);
    label.htmlFor = `colorThemePicker_${field.key}`;

    if (field.type === "color") {
      const swatch = element("input", "ctp-swatch");
      const hex = element("input", "ctp-hex");
      swatch.type = "color";
      swatch.id = `colorThemePicker_${field.key}`;
      hex.type = "text";
      hex.id = `colorThemePickerText_${field.key}`;
      hex.maxLength = 7;
      hex.setAttribute("aria-label", `${field.label} hex value`);
      swatch.addEventListener("input", () => {
        hex.value = swatch.value.toUpperCase();
        preview();
      });
      hex.addEventListener("change", () => {
        hex.value = safeValue(field, hex.value);
        swatch.value = hex.value;
        preview();
      });
      row.append(label, swatch, hex);
      return row;
    }

    if (field.type === "number") {
      const range = element("input", "ctp-size-range");
      const number = element("input", "ctp-size-value");
      range.type = "range";
      range.id = `colorThemePicker_${field.key}`;
      number.type = "number";
      number.id = `colorThemePickerValue_${field.key}`;
      [range, number].forEach(input => {
        input.min = String(field.min);
        input.max = String(field.max);
        input.step = "1";
      });
      const update = value => {
        const safe = safeValue(field, value);
        range.value = String(safe);
        number.value = String(safe);
        preview();
      };
      range.addEventListener("input", () => update(range.value));
      number.addEventListener("change", () => update(number.value));
      row.append(label, range, number);
      return row;
    }

    const select = element("select", "ctp-font-select");
    select.id = `colorThemePicker_${field.key}`;
    fontOptions.forEach(([value, text]) => {
      const option = element("option", "", text);
      option.value = value;
      select.appendChild(option);
    });
    select.addEventListener("change", preview);
    row.append(label, select);
    return row;
  }

  function formTheme() {
    return safeTheme(Object.fromEntries(fields.map(field => {
      if (field.type === "color") {
        return [field.key, document.getElementById(`colorThemePickerText_${field.key}`)?.value];
      }
      if (field.type === "number") {
        return [field.key, document.getElementById(`colorThemePickerValue_${field.key}`)?.value];
      }
      return [field.key, document.getElementById(`colorThemePicker_${field.key}`)?.value];
    })));
  }

  function setForm(theme) {
    const current = safeTheme(theme);
    fields.forEach(field => {
      if (field.type === "color") {
        document.getElementById(`colorThemePicker_${field.key}`).value = current[field.key];
        document.getElementById(`colorThemePickerText_${field.key}`).value = current[field.key];
      } else if (field.type === "number") {
        document.getElementById(`colorThemePicker_${field.key}`).value = String(current[field.key]);
        document.getElementById(`colorThemePickerValue_${field.key}`).value = String(current[field.key]);
      } else {
        document.getElementById(`colorThemePicker_${field.key}`).value = current[field.key];
      }
    });
  }

  function preview() {
    applyTheme(formTheme());
  }

  function closePicker() {
    const modal = document.getElementById("colorThemePickerModal");
    if (!modal) return;
    setForm(loadTheme());
    applyTheme(loadTheme());
    modal.hidden = true;
    isOpen = false;
  }

  function openPicker() {
    const modal = document.getElementById("colorThemePickerModal");
    if (!modal) return;
    const theme = loadTheme();
    setForm(theme);
    applyTheme(theme);
    modal.hidden = false;
    isOpen = true;
    modal.querySelector("input, select")?.focus();
  }

  function resetTheme() {
    localStorage.removeItem(storageKey);
    setForm(defaults);
    applyTheme(defaults);
  }

  function saveCurrentTheme() {
    const theme = formTheme();
    saveTheme(theme);
    applyTheme(theme);
    closePicker();
  }

  function downloadSavedSettings() {
    const data = {
      app: "Personal Memory-Based File Archiver",
      type: "organize-your-pc-settings",
      schemaVersion: 1,
      exportedAt: new Date().toISOString(),
      storageKey,
      settings: loadTheme()
    };
    window.AppUtils.downloadTextFile(
      "organize_your_pc_settings.json",
      JSON.stringify(data, null, 2),
      "application/json;charset=utf-8"
    );
  }

  function action(text, className, handler) {
    const button = element("button", className, text);
    button.type = "button";
    button.addEventListener("click", handler);
    return button;
  }

  function initialize() {
    if (document.getElementById("colorThemePickerModal")) return;
    injectStyles();

    const headerActions = document.querySelector(".header-actions");
    if (headerActions && !document.getElementById("openColorThemePickerButton")) {
      const button = action("Settings", "button button-secondary", openPicker);
      button.id = "openColorThemePickerButton";
      headerActions.appendChild(button);
    }

    const modal = element("div");
    modal.id = "colorThemePickerModal";
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");
    modal.setAttribute("aria-labelledby", "colorThemePickerTitle");
    modal.hidden = true;

    const card = element("div", "ctp-card");
    const header = element("div", "ctp-header");
    const titleWrap = element("div");
    const title = element("h2", "", "Settings");
    title.id = "colorThemePickerTitle";
    titleWrap.append(
      title,
      element("p", "ctp-intro", "Essential colors, readability, button size, and font settings. Changes preview live and are saved locally in this browser.")
    );
    const close = action("×", "ctp-close", closePicker);
    close.setAttribute("aria-label", "Close settings");
    header.append(titleWrap, close);

    const grid = element("div", "ctp-grid");
    sections.forEach(section => {
      grid.appendChild(element("div", "ctp-section-title", section.title));
      section.fields.forEach(field => grid.appendChild(createField(field)));
    });

    const actions = element("div", "ctp-actions");
    actions.append(
      action("Reset", "button button-secondary", resetTheme),
      action("Download settings", "button button-secondary", downloadSavedSettings),
      action("Close", "button button-secondary", closePicker),
      action("Save settings", "button ctp-save-button", saveCurrentTheme)
    );

    card.append(header, grid, actions);
    modal.appendChild(card);
    document.body.appendChild(modal);
    document.addEventListener("keydown", event => {
      if (event.key === "Escape" && isOpen) closePicker();
    });
    applyTheme(loadTheme());
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initialize);
  } else {
    initialize();
  }

  return { applyTheme, loadTheme, saveTheme, resetTheme, openPicker, closePicker, initialize };
})();
