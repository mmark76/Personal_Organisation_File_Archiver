/* User-controlled color theme picker. */

window.ColorThemePicker = (() => {
  const storageKey = "organizeYourPcColorTheme";

  const defaultTheme = {
    appBg: "#000000",
    appSurface: "#0a0a0a",
    appSurfaceSoft: "#111111",
    appText: "#ffffff",
    appMuted: "#ffffff",
    appPrimary: "#6b7280",
    appPrimaryHover: "#9ca3af",
    appSuccess: "#166534",
    appDanger: "#b91c1c",
    appFocus: "#2563eb",
    appHighlight: "#fbbf24",
    appBorder: "#404040",
    appBorderSoft: "#262626",
    buttonBorder: "#ffffff",
    buttonBorderHover: "#ffffff",
    choiceBorder: "#ffffff",
    archiveDestinationBorder: "#ffffff",
    inputBorder: "#404040",
    modalBorder: "#404040"
  };

  const fields = [
    { key: "appBg", label: "Page background", cssVariable: "--app-bg" },
    { key: "appSurface", label: "Main surface", cssVariable: "--app-surface" },
    { key: "appSurfaceSoft", label: "Soft surface", cssVariable: "--app-surface-soft" },
    { key: "appText", label: "Main text", cssVariable: "--app-text" },
    { key: "appMuted", label: "Muted text", cssVariable: "--app-muted" },
    { key: "appPrimary", label: "Primary button", cssVariable: "--app-primary" },
    { key: "appPrimaryHover", label: "Primary button hover", cssVariable: "--app-primary-hover" },
    { key: "appSuccess", label: "Success button", cssVariable: "--app-success" },
    { key: "appDanger", label: "Danger button", cssVariable: "--app-danger" },
    { key: "appFocus", label: "Focus outline", cssVariable: "--app-focus" },
    { key: "appHighlight", label: "Main title highlight", cssVariable: "--custom-highlight" },
    { key: "appBorder", label: "App frame border", cssVariable: "--app-border" },
    { key: "appBorderSoft", label: "Soft/internal border", cssVariable: "--app-border-soft" },
    { key: "buttonBorder", label: "Button border", cssVariable: "--button-border" },
    { key: "buttonBorderHover", label: "Button hover border", cssVariable: "--button-border-hover" },
    { key: "choiceBorder", label: "Choice card border", cssVariable: "--choice-card-border" },
    { key: "archiveDestinationBorder", label: "Archive selection border", cssVariable: "--archive-destination-border" },
    { key: "inputBorder", label: "Input field border", cssVariable: "--input-border" },
    { key: "modalBorder", label: "Color modal border", cssVariable: "--color-modal-border" }
  ];

  let isOpen = false;

  function isValidHexColor(value) {
    return /^#[0-9a-f]{6}$/i.test(String(value || "").trim());
  }

  function normalizeHexColor(value) {
    const normalized = String(value || "").trim().toUpperCase();
    return isValidHexColor(normalized) ? normalized : null;
  }

  function getSafeTheme(theme) {
    const safeTheme = { ...defaultTheme };

    if (!theme || typeof theme !== "object") {
      return safeTheme;
    }

    fields.forEach(field => {
      const normalized = normalizeHexColor(theme[field.key]);
      if (normalized) {
        safeTheme[field.key] = normalized;
      }
    });

    return safeTheme;
  }

  function loadTheme() {
    try {
      const stored = localStorage.getItem(storageKey);
      return getSafeTheme(stored ? JSON.parse(stored) : defaultTheme);
    } catch (error) {
      return { ...defaultTheme };
    }
  }

  function saveTheme(theme) {
    localStorage.setItem(storageKey, JSON.stringify(getSafeTheme(theme)));
  }

  function clearTheme() {
    localStorage.removeItem(storageKey);
  }

  function applyTheme(theme) {
    const safeTheme = getSafeTheme(theme);
    const rootStyle = document.documentElement.style;

    fields.forEach(field => {
      rootStyle.setProperty(field.cssVariable, safeTheme[field.key]);
    });

    rootStyle.setProperty("--app-muted-strong", safeTheme.appMuted);
    applyGeneratedThemeStyles(safeTheme);
  }

  function applyGeneratedThemeStyles(theme) {
    let style = document.getElementById("colorThemePickerGeneratedStyles");

    if (!style) {
      style = document.createElement("style");
      style.id = "colorThemePickerGeneratedStyles";
      document.head.appendChild(style);
    }

    style.textContent = `
      .app-brand h1 {
        color: ${theme.appHighlight};
      }

      .button,
      button,
      .button-secondary,
      .button-success,
      .button-danger,
      .header-actions .button {
        border-color: ${theme.buttonBorder};
      }

      .button:hover,
      button:hover,
      .button-secondary:hover,
      .button-success:hover,
      .button-danger:hover,
      .header-actions .button:hover {
        border-color: ${theme.buttonBorderHover};
      }

      .choice-card,
      .choice-card:hover {
        border-color: ${theme.choiceBorder};
        box-shadow: 0 0 0 1px color-mix(in srgb, ${theme.choiceBorder} 18%, transparent), 0 18px 44px rgba(0, 0, 0, 0.35);
      }

      .archive-destination-button:hover,
      .archive-destination-button.archive-destination-selected {
        border-color: ${theme.archiveDestinationBorder};
      }

      input,
      select,
      textarea {
        border-color: ${theme.inputBorder};
      }

      .ctp-card,
      .ctp-row,
      .ctp-hex,
      .ctp-swatch,
      .ctp-close {
        border-color: ${theme.modalBorder};
      }
    `;
  }

  function injectPickerStyles() {
    if (document.getElementById("colorThemePickerStyles")) {
      return;
    }

    const style = document.createElement("style");
    style.id = "colorThemePickerStyles";
    style.textContent = `
      #colorThemePickerModal {
        position: fixed;
        top: 92px;
        right: 18px;
        left: auto;
        bottom: auto;
        z-index: 1000;
        width: min(380px, calc(100vw - 24px));
        padding: 0;
        background: transparent;
        pointer-events: none;
      }

      #colorThemePickerModal[hidden] {
        display: none !important;
      }

      .ctp-card {
        width: 100%;
        max-height: calc(100vh - 122px);
        overflow: auto;
        padding: 16px;
        border: 1px solid var(--color-modal-border, #404040);
        border-radius: 18px;
        background:
          linear-gradient(180deg, rgba(255, 255, 255, 0.035), rgba(255, 255, 255, 0.015)),
          #060606;
        box-shadow: 0 18px 56px rgba(0, 0, 0, 0.62);
        color: var(--app-text);
        pointer-events: auto;
      }

      .ctp-header {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 12px;
        margin-bottom: 8px;
      }

      .ctp-header h2 {
        margin: 0;
        font-size: 19px;
        line-height: 1.2;
        font-weight: 800;
        color: #ffffff;
      }

      .ctp-close {
        width: 34px;
        min-width: 34px;
        height: 34px;
        min-height: 34px;
        padding: 0;
        border: 1px solid var(--color-modal-border, #404040);
        border-radius: 10px;
        background: transparent;
        color: #ffffff;
        font-size: 21px;
        line-height: 1;
      }

      .ctp-close:hover {
        background: rgba(255, 255, 255, 0.08);
        color: #ffffff;
      }

      .ctp-intro {
        margin: 4px 0 12px;
        color: rgba(255, 255, 255, 0.82);
        font-size: 12px;
        line-height: 1.4;
      }

      .ctp-grid {
        display: grid;
        gap: 7px;
      }

      .ctp-row {
        display: grid;
        grid-template-columns: minmax(130px, 1fr) 40px 78px;
        align-items: center;
        gap: 8px;
        padding: 8px 9px;
        border: 1px solid var(--color-modal-border, #404040);
        border-radius: 12px;
        background: rgba(255, 255, 255, 0.025);
      }

      .ctp-label {
        margin: 0;
        color: #ffffff;
        font-size: 12px;
        font-weight: 700;
        text-align: left;
      }

      .ctp-swatch {
        width: 34px;
        height: 26px;
        padding: 0;
        border: 1px solid var(--color-modal-border, #404040);
        border-radius: 8px;
        background: transparent;
        cursor: pointer;
      }

      .ctp-hex {
        width: 78px;
        min-width: 78px;
        padding: 6px 7px;
        border: 1px solid var(--color-modal-border, #404040);
        border-radius: 8px;
        background: #0d0d0d;
        color: #ffffff;
        font-size: 11px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.02em;
        text-align: center;
      }

      .ctp-actions {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 8px;
        margin-top: 12px;
      }

      .ctp-actions .button,
      .ctp-actions button {
        min-height: 34px;
        padding: 7px 9px;
        font-size: 12px;
      }

      .ctp-actions .ctp-save-button {
        grid-column: 1 / -1;
      }

      @media (max-width: 720px) {
        #colorThemePickerModal {
          top: auto;
          right: 12px;
          bottom: 12px;
          width: min(360px, calc(100vw - 24px));
        }

        .ctp-card {
          max-height: min(70vh, 560px);
        }
      }
    `;

    document.head.appendChild(style);
  }

  function getModal() {
    return document.getElementById("colorThemePickerModal");
  }

  function createButton() {
    if (document.getElementById("openColorThemePickerButton")) {
      return;
    }

    const headerActions = document.querySelector(".header-actions");
    if (!headerActions) {
      return;
    }

    const button = document.createElement("button");
    button.type = "button";
    button.id = "openColorThemePickerButton";
    button.className = "button button-secondary";
    button.textContent = "Customize App Appearance and Colors";
    button.addEventListener("click", openPicker);

    headerActions.appendChild(button);
  }

  function createFieldRow(field) {
    const row = document.createElement("div");
    row.className = "ctp-row";

    const label = document.createElement("label");
    label.className = "ctp-label";
    label.setAttribute("for", `colorThemePicker_swatch_${field.key}`);
    label.textContent = field.label;

    const swatch = document.createElement("input");
    swatch.type = "color";
    swatch.id = `colorThemePicker_swatch_${field.key}`;
    swatch.name = field.key;
    swatch.className = "ctp-swatch";
    swatch.dataset.key = field.key;
    swatch.value = defaultTheme[field.key];
    swatch.addEventListener("input", event => {
      const value = event.target.value.toUpperCase();
      const hexInput = document.getElementById(`colorThemePicker_hex_${field.key}`);
      if (hexInput) {
        hexInput.value = value;
      }
      handleLivePreview();
    });

    const hexInput = document.createElement("input");
    hexInput.type = "text";
    hexInput.id = `colorThemePicker_hex_${field.key}`;
    hexInput.className = "ctp-hex";
    hexInput.inputMode = "text";
    hexInput.maxLength = 7;
    hexInput.value = defaultTheme[field.key];
    hexInput.setAttribute("aria-label", `${field.label} hex value`);

    hexInput.addEventListener("input", event => {
      event.target.value = event.target.value.toUpperCase();
    });

    hexInput.addEventListener("change", event => {
      const normalized = normalizeHexColor(event.target.value);
      const swatchInput = document.getElementById(`colorThemePicker_swatch_${field.key}`);

      if (normalized) {
        event.target.value = normalized;
        if (swatchInput) {
          swatchInput.value = normalized;
        }
        handleLivePreview();
      } else {
        const currentTheme = getFormTheme();
        event.target.value = currentTheme[field.key];
      }
    });

    row.append(label, swatch, hexInput);
    return row;
  }

  function createModal() {
    if (getModal()) {
      return;
    }

    injectPickerStyles();

    const modal = document.createElement("div");
    modal.id = "colorThemePickerModal";
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");
    modal.setAttribute("aria-labelledby", "colorThemePickerTitle");
    modal.hidden = true;

    const card = document.createElement("div");
    card.className = "ctp-card";

    const header = document.createElement("div");
    header.className = "ctp-header";

    const titleWrap = document.createElement("div");

    const title = document.createElement("h2");
    title.id = "colorThemePickerTitle";
    title.textContent = "Choose app colors";

    const intro = document.createElement("p");
    intro.className = "ctp-intro";
    intro.textContent = "Small docked panel. Changes are previewed live and saved locally in this browser.";

    titleWrap.append(title, intro);

    const closeButton = document.createElement("button");
    closeButton.type = "button";
    closeButton.className = "ctp-close";
    closeButton.setAttribute("aria-label", "Close color picker");
    closeButton.textContent = "×";
    closeButton.addEventListener("click", closePicker);

    header.append(titleWrap, closeButton);

    const grid = document.createElement("div");
    grid.id = "colorThemePickerGrid";
    grid.className = "ctp-grid";

    fields.forEach(field => {
      grid.appendChild(createFieldRow(field));
    });

    const actions = document.createElement("div");
    actions.className = "ctp-actions";

    const resetButton = document.createElement("button");
    resetButton.type = "button";
    resetButton.className = "button button-secondary";
    resetButton.textContent = "Reset";
    resetButton.addEventListener("click", resetTheme);

    const closeActionButton = document.createElement("button");
    closeActionButton.type = "button";
    closeActionButton.className = "button button-secondary";
    closeActionButton.textContent = "Close";
    closeActionButton.addEventListener("click", closePicker);

    const saveButton = document.createElement("button");
    saveButton.type = "button";
    saveButton.className = "button ctp-save-button";
    saveButton.textContent = "Save colors";
    saveButton.addEventListener("click", saveCurrentTheme);

    actions.append(resetButton, closeActionButton, saveButton);

    card.append(header, grid, actions);
    modal.appendChild(card);

    document.addEventListener("keydown", event => {
      if (event.key === "Escape" && isOpen) {
        closePicker();
      }
    });

    document.body.appendChild(modal);
  }

  function getFormTheme() {
    const theme = {};

    fields.forEach(field => {
      const swatchInput = document.getElementById(`colorThemePicker_swatch_${field.key}`);
      const hexInput = document.getElementById(`colorThemePicker_hex_${field.key}`);

      const hexValue = normalizeHexColor(hexInput ? hexInput.value : "");
      const swatchValue = normalizeHexColor(swatchInput ? swatchInput.value : "");

      theme[field.key] = hexValue || swatchValue || defaultTheme[field.key];
    });

    return getSafeTheme(theme);
  }

  function setFormTheme(theme) {
    const safeTheme = getSafeTheme(theme);

    fields.forEach(field => {
      const swatchInput = document.getElementById(`colorThemePicker_swatch_${field.key}`);
      const hexInput = document.getElementById(`colorThemePicker_hex_${field.key}`);

      if (swatchInput) {
        swatchInput.value = safeTheme[field.key];
      }

      if (hexInput) {
        hexInput.value = safeTheme[field.key];
      }
    });
  }

  function handleLivePreview() {
    applyTheme(getFormTheme());
  }

  function saveCurrentTheme() {
    const theme = getFormTheme();
    saveTheme(theme);
    applyTheme(theme);
    closePicker();
  }

  function resetTheme() {
    clearTheme();
    setFormTheme(defaultTheme);
    applyTheme(defaultTheme);
  }

  function openPicker() {
    const modal = getModal();
    if (!modal) {
      return;
    }

    const currentTheme = loadTheme();
    setFormTheme(currentTheme);
    applyTheme(currentTheme);

    modal.hidden = false;
    isOpen = true;

    const firstSwatch = modal.querySelector(".ctp-swatch");
    if (firstSwatch) {
      firstSwatch.focus();
    }
  }

  function closePicker() {
    const modal = getModal();
    if (!modal) {
      return;
    }

    const savedTheme = loadTheme();
    setFormTheme(savedTheme);
    applyTheme(savedTheme);

    modal.hidden = true;
    isOpen = false;
  }

  function initialize() {
    createButton();
    createModal();
    applyTheme(loadTheme());
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initialize);
  } else {
    initialize();
  }

  return {
    applyTheme,
    loadTheme,
    saveTheme,
    resetTheme,
    openPicker,
    closePicker,
    initialize
  };
})();
