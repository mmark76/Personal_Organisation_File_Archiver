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
    appHighlight: "#fbbf24"
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
    { key: "appHighlight", label: "Main title highlight", cssVariable: "--custom-highlight" }
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
    applyHighlightStyle(safeTheme.appHighlight);
  }

  function applyHighlightStyle(highlightColor) {
    let style = document.getElementById("colorThemePickerHighlightStyles");

    if (!style) {
      style = document.createElement("style");
      style.id = "colorThemePickerHighlightStyles";
      document.head.appendChild(style);
    }

    style.textContent = `
      .app-brand h1 {
        color: ${highlightColor};
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
        inset: 0;
        z-index: 1000;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 24px;
        background: rgba(0, 0, 0, 0.76);
        backdrop-filter: blur(6px);
      }

      #colorThemePickerModal[hidden] {
        display: none !important;
      }

      .ctp-card {
        width: min(760px, calc(100vw - 32px));
        max-height: min(82vh, 820px);
        overflow: auto;
        padding: 24px;
        border: 1px solid rgba(255, 255, 255, 0.14);
        border-radius: 22px;
        background:
          linear-gradient(180deg, rgba(255, 255, 255, 0.04), rgba(255, 255, 255, 0.02)),
          #060606;
        box-shadow: 0 28px 80px rgba(0, 0, 0, 0.55);
        color: var(--app-text);
      }

      .ctp-header {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 16px;
        margin-bottom: 10px;
      }

      .ctp-header h2 {
        margin: 0;
        font-size: 28px;
        line-height: 1.15;
        font-weight: 800;
        color: #ffffff;
      }

      .ctp-close {
        width: 42px;
        min-width: 42px;
        height: 42px;
        min-height: 42px;
        padding: 0;
        border: 1px solid #ffffff;
        border-radius: 12px;
        background: transparent;
        color: #ffffff;
        font-size: 24px;
        line-height: 1;
      }

      .ctp-close:hover {
        background: rgba(255, 255, 255, 0.08);
        color: #ffffff;
        border-color: #ffffff;
      }

      .ctp-intro {
        margin: 0 0 18px;
        color: rgba(255, 255, 255, 0.88);
        font-size: 14px;
        line-height: 1.5;
      }

      .ctp-grid {
        display: grid;
        gap: 12px;
      }

      .ctp-row {
        display: grid;
        grid-template-columns: minmax(180px, 1fr) auto auto;
        align-items: center;
        gap: 12px;
        padding: 12px 14px;
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 14px;
        background: rgba(255, 255, 255, 0.03);
      }

      .ctp-label {
        margin: 0;
        color: #ffffff;
        font-size: 14px;
        font-weight: 700;
        text-align: left;
      }

      .ctp-swatch {
        width: 54px;
        height: 36px;
        padding: 0;
        border: 1px solid rgba(255, 255, 255, 0.55);
        border-radius: 10px;
        background: transparent;
        cursor: pointer;
      }

      .ctp-hex {
        width: 104px;
        min-width: 104px;
        padding: 8px 10px;
        border: 1px solid rgba(255, 255, 255, 0.18);
        border-radius: 10px;
        background: #0d0d0d;
        color: #ffffff;
        font-size: 13px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.03em;
        text-align: center;
      }

      .ctp-actions {
        display: flex;
        flex-wrap: wrap;
        justify-content: flex-end;
        gap: 10px;
        margin-top: 20px;
      }

      .ctp-actions .button,
      .ctp-actions button {
        min-height: 40px;
      }

      @media (max-width: 640px) {
        #colorThemePickerModal {
          padding: 14px;
        }

        .ctp-card {
          padding: 18px;
          border-radius: 18px;
        }

        .ctp-header h2 {
          font-size: 24px;
        }

        .ctp-row {
          grid-template-columns: 1fr;
          justify-items: start;
          gap: 10px;
        }

        .ctp-label {
          text-align: left;
        }

        .ctp-controls {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .ctp-actions {
          justify-content: stretch;
        }

        .ctp-actions .button,
        .ctp-actions button {
          flex: 1 1 100%;
        }
      }
    `;

    document.head.appendChild(style);
  }

  function getModal() {
    return document.getElementById("colorThemePickerModal");
  }

  function getGrid() {
    return document.getElementById("colorThemePickerGrid");
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

    const controls = document.createElement("div");
    controls.className = "ctp-controls";

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

    controls.appendChild(swatch);

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

    row.append(label, controls, hexInput);
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
    intro.textContent = "Select colors for the app. Changes are previewed live and saved locally in this browser.";

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
    resetButton.textContent = "Reset defaults";
    resetButton.addEventListener("click", resetTheme);

    const closeActionButton = document.createElement("button");
    closeActionButton.type = "button";
    closeActionButton.className = "button button-secondary";
    closeActionButton.textContent = "Close";
    closeActionButton.addEventListener("click", closePicker);

    const saveButton = document.createElement("button");
    saveButton.type = "button";
    saveButton.className = "button";
    saveButton.textContent = "Save colors";
    saveButton.addEventListener("click", saveCurrentTheme);

    actions.append(resetButton, closeActionButton, saveButton);

    card.append(header, grid, actions);
    modal.appendChild(card);

    modal.addEventListener("click", event => {
      if (event.target === modal) {
        closePicker();
      }
    });

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
