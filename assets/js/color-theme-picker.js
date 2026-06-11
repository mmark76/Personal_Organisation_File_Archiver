/* User-controlled settings panel for appearance, layout, borders, sizes, and fonts. */

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

  const defaultTheme = {
    appBg: "#000000",
    appSurface: "#0A0A0A",
    appSurfaceSoft: "#111111",
    appText: "#FFFFFF",
    appMuted: "#FFFFFF",
    appPrimary: "#6B7280",
    appPrimaryHover: "#9CA3AF",
    appSuccess: "#166534",
    appDanger: "#B91C1C",
    appFocus: "#2563EB",
    appHighlight: "#FBBF24",
    appBorder: "#404040",
    appBorderSoft: "#262626",
    buttonBorder: "#819C87",
    buttonBorderHover: "#FFFFFF",
    choiceBorder: "#7E8452",
    archiveDestinationBorder: "#FFFFFF",
    inputBorder: "#404040",
    modalBorder: "#404040",
    appWidth: 760,
    homePanelWidth: 520,
    workPanelWidth: 640,
    headerPaddingY: 10,
    headerPaddingX: 12,
    homePanelPadding: 42,
    workPanelPadding: 10,
    choiceCardHeight: 72,
    choiceCardPadding: 8,
    choiceGridGap: 6,
    buttonHeight: 28,
    buttonPaddingY: 4,
    buttonPaddingX: 28,
    settingsPanelWidth: 420,
    appFont: "Trebuchet MS, Arial, sans-serif",
    monoFont: "Segoe UI Mono, Consolas, monospace",
    titleFontSize: 64,
    subtitleFontSize: 17,
    bodyFontSize: 11,
    panelTitleFontSize: 16,
    buttonFontSize: 13,
    choiceTitleFontSize: 17,
    choiceTextFontSize: 11,
    treeFontSize: 11
  };

  const colorFields = [
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
    { key: "modalBorder", label: "Settings panel border", cssVariable: "--color-modal-border" }
  ];

  const sizeFields = [
    { key: "appWidth", label: "Common app width", min: 760, max: 1280, step: 10 },
    { key: "homePanelWidth", label: "Home panel width", min: 520, max: 1180, step: 10 },
    { key: "workPanelWidth", label: "Work panel width", min: 640, max: 1180, step: 10 },
    { key: "headerPaddingY", label: "Header vertical padding", min: 10, max: 42, step: 1 },
    { key: "headerPaddingX", label: "Header side padding", min: 12, max: 48, step: 1 },
    { key: "homePanelPadding", label: "Home panel padding", min: 10, max: 42, step: 1 },
    { key: "workPanelPadding", label: "Work panel padding", min: 10, max: 42, step: 1 },
    { key: "choiceCardHeight", label: "Choice card height", min: 72, max: 180, step: 2 },
    { key: "choiceCardPadding", label: "Choice card padding", min: 8, max: 28, step: 1 },
    { key: "choiceGridGap", label: "Choice card gap", min: 6, max: 28, step: 1 },
    { key: "buttonHeight", label: "Button height", min: 28, max: 54, step: 1 },
    { key: "buttonPaddingY", label: "Button vertical padding", min: 4, max: 18, step: 1 },
    { key: "buttonPaddingX", label: "Button side padding", min: 8, max: 28, step: 1 },
    { key: "settingsPanelWidth", label: "Settings panel width", min: 300, max: 520, step: 10 }
  ];

  const fontSizeFields = [
    { key: "titleFontSize", label: "Main title size", min: 30, max: 64, step: 1 },
    { key: "subtitleFontSize", label: "Subtitle size", min: 14, max: 32, step: 1 },
    { key: "bodyFontSize", label: "Body text size", min: 11, max: 18, step: 1 },
    { key: "panelTitleFontSize", label: "Panel title size", min: 16, max: 30, step: 1 },
    { key: "buttonFontSize", label: "Button text size", min: 11, max: 18, step: 1 },
    { key: "choiceTitleFontSize", label: "Choice title size", min: 13, max: 24, step: 1 },
    { key: "choiceTextFontSize", label: "Choice text size", min: 11, max: 18, step: 1 },
    { key: "treeFontSize", label: "Tree/code text size", min: 10, max: 16, step: 1 }
  ];

  const fontFields = [
    { key: "appFont", label: "Main font" },
    { key: "monoFont", label: "Tree/code font" }
  ];

  let isOpen = false;

  function createElement(tag, className, text) {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text !== undefined) element.textContent = text;
    return element;
  }

  function isValidHexColor(value) {
    return /^#[0-9a-f]{6}$/i.test(String(value || "").trim());
  }

  function normalizeHexColor(value) {
    const normalized = String(value || "").trim().toUpperCase();
    return isValidHexColor(normalized) ? normalized : null;
  }

  function clampNumber(value, min, max) {
    const number = Number(value);
    if (!Number.isFinite(number)) return null;
    return Math.min(max, Math.max(min, Math.round(number)));
  }

  function isValidFont(value) {
    return fontOptions.some(([fontValue]) => fontValue === value);
  }

  function getSafeTheme(theme) {
    const safeTheme = { ...defaultTheme };

    if (!theme || typeof theme !== "object") return safeTheme;

    colorFields.forEach(field => {
      const normalized = normalizeHexColor(theme[field.key]);
      if (normalized) safeTheme[field.key] = normalized;
    });

    [...sizeFields, ...fontSizeFields].forEach(field => {
      const value = clampNumber(theme[field.key], field.min, field.max);
      if (value !== null) safeTheme[field.key] = value;
    });

    fontFields.forEach(field => {
      if (isValidFont(theme[field.key])) safeTheme[field.key] = theme[field.key];
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

  function downloadSavedSettings() {
    const exportData = {
      app: "Personal Memory-Based File Archiver",
      type: "organize-your-pc-settings",
      schemaVersion: 1,
      exportedAt: new Date().toISOString(),
      storageKey,
      settings: loadTheme()
    };

    window.AppUtils.downloadTextFile(
      "organize_your_pc_settings.json",
      JSON.stringify(exportData, null, 2),
      "application/json;charset=utf-8"
    );
  }

  function applyTheme(theme) {
    const safeTheme = getSafeTheme(theme);
    const rootStyle = document.documentElement.style;

    colorFields.forEach(field => {
      rootStyle.setProperty(field.cssVariable, safeTheme[field.key]);
    });

    rootStyle.setProperty("--app-width", `${safeTheme.appWidth}px`);
    rootStyle.setProperty("--app-font", safeTheme.appFont);
    rootStyle.setProperty("--app-mono", safeTheme.monoFont);
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

    const headerActionHeight = Math.max(30, Math.round(theme.buttonHeight * 0.94));
    const headerActionPaddingY = Math.max(5, Math.round(theme.buttonPaddingY * 0.85));
    const headerActionPaddingX = Math.max(10, Math.round(theme.buttonPaddingX * 1.08));

    style.textContent = `
      .app-brand h1 { color: ${theme.appHighlight}; font-size: clamp(30px, 4vw, ${theme.titleFontSize}px); }
      .app-subtitle { font-size: clamp(14px, 2vw, ${theme.subtitleFontSize}px); }

      .app-intro,
      .screen-card p,
      .work-panel p,
      .guidance-card span,
      .small-note,
      .file-status-box,
      .advisor-suggestion-box,
      .archive-result-box,
      .examples-box,
      .fixed-type {
        font-size: ${theme.bodyFontSize}px;
      }

      .screen-card h2,
      .work-panel h2 {
        font-size: ${theme.panelTitleFontSize}px;
      }

      .app-header-inner { padding: ${theme.headerPaddingY}px ${theme.headerPaddingX}px; }
      .screen-card { width: min(${theme.homePanelWidth}px, 100%); padding: ${theme.homePanelPadding}px; }
      .work-panel { max-width: ${theme.workPanelWidth}px; padding: ${theme.workPanelPadding}px; }
      .choice-grid { gap: ${theme.choiceGridGap}px; }
      .choice-card { min-height: ${theme.choiceCardHeight}px; padding: ${theme.choiceCardPadding}px; }
      .choice-card strong { font-size: ${theme.choiceTitleFontSize}px; }
      .choice-card span { font-size: ${theme.choiceTextFontSize}px; }

      .button,
      button,
      .button-secondary,
      .button-success,
      .button-danger {
        min-height: ${theme.buttonHeight}px;
        padding: ${theme.buttonPaddingY}px ${theme.buttonPaddingX}px;
        font-size: ${theme.buttonFontSize}px;
        border-color: ${theme.buttonBorder};
      }

      .header-actions .button {
        min-height: ${headerActionHeight}px;
        padding: ${headerActionPaddingY}px ${headerActionPaddingX}px;
        font-size: ${Math.max(11, theme.buttonFontSize - 1)}px;
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

      .structure-output,
      .folder-tree-preview,
      .folder-display-code {
        font-size: ${theme.treeFontSize}px;
      }

      input,
      select,
      textarea {
        border-color: ${theme.inputBorder};
      }

      #colorThemePickerModal {
        width: min(${theme.settingsPanelWidth}px, calc(100vw - 24px));
      }

      .ctp-card,
      .ctp-row,
      .ctp-size-row,
      .ctp-font-row,
      .ctp-hex,
      .ctp-size-value,
      .ctp-swatch,
      .ctp-close,
      .ctp-font-select {
        border-color: ${theme.modalBorder};
      }
    `;
  }

  function injectPickerStyles() {
    if (document.getElementById("colorThemePickerStyles")) return;

    const style = document.createElement("style");
    style.id = "colorThemePickerStyles";
    style.textContent = `
      #colorThemePickerModal {
        position: fixed;
        top: 92px;
        right: 18px;
        z-index: 1000;
        width: min(420px, calc(100vw - 24px));
        padding: 0;
        background: transparent;
        pointer-events: none;
      }

      #colorThemePickerModal[hidden] { display: none !important; }

      .ctp-card {
        width: 100%;
        max-height: calc(100vh - 122px);
        overflow: auto;
        padding: 16px;
        border: 1px solid var(--color-modal-border, #404040);
        border-radius: 18px;
        background: #060606;
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

      .ctp-section-title {
        margin: 12px 0 7px;
        padding-top: 9px;
        border-top: 1px solid rgba(255, 255, 255, 0.08);
        color: rgba(255, 255, 255, 0.92);
        font-size: 11px;
        font-weight: 850;
        letter-spacing: 0.08em;
        text-transform: uppercase;
      }

      .ctp-section-title:first-child {
        margin-top: 0;
        padding-top: 0;
        border-top: 0;
      }

      .ctp-row,
      .ctp-size-row,
      .ctp-font-row {
        display: grid;
        align-items: center;
        gap: 8px;
        padding: 8px 9px;
        border: 1px solid var(--color-modal-border, #404040);
        border-radius: 12px;
        background: rgba(255, 255, 255, 0.025);
      }

      .ctp-row { grid-template-columns: minmax(130px, 1fr) 40px 78px; }
      .ctp-size-row { grid-template-columns: minmax(112px, 1fr) minmax(86px, 120px) 58px; }
      .ctp-font-row { grid-template-columns: minmax(112px, 1fr) minmax(150px, 1.2fr); }

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

      .ctp-hex,
      .ctp-size-value,
      .ctp-font-select {
        border: 1px solid var(--color-modal-border, #404040);
        border-radius: 8px;
        background: #0d0d0d;
        color: #ffffff;
        font-size: 11px;
        font-weight: 700;
        text-align: center;
      }

      .ctp-hex {
        width: 78px;
        min-width: 78px;
        padding: 6px 7px;
        text-transform: uppercase;
        letter-spacing: 0.02em;
      }

      .ctp-size-value {
        width: 58px;
        min-width: 58px;
        padding: 6px 5px;
      }

      .ctp-size-range {
        width: 100%;
        padding: 0;
        border: 0;
        background: transparent;
        accent-color: var(--app-primary-hover);
      }

      .ctp-font-select {
        width: 100%;
        padding: 6px 7px;
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
    if (document.getElementById("openColorThemePickerButton")) return;

    const headerActions = document.querySelector(".header-actions");
    if (!headerActions) return;

    const button = createElement("button", "button button-secondary", "Settings");
    button.type = "button";
    button.id = "openColorThemePickerButton";
    button.addEventListener("click", openPicker);
    headerActions.appendChild(button);
  }

  function createSectionTitle(text) {
    return createElement("div", "ctp-section-title", text);
  }

  function createColorRow(field) {
    const row = createElement("div", "ctp-row");
    const label = createElement("label", "ctp-label", field.label);
    label.setAttribute("for", `colorThemePicker_swatch_${field.key}`);

    const swatch = createElement("input", "ctp-swatch");
    swatch.type = "color";
    swatch.id = `colorThemePicker_swatch_${field.key}`;
    swatch.name = field.key;
    swatch.value = defaultTheme[field.key];

    const hexInput = createElement("input", "ctp-hex");
    hexInput.type = "text";
    hexInput.id = `colorThemePicker_hex_${field.key}`;
    hexInput.inputMode = "text";
    hexInput.maxLength = 7;
    hexInput.value = defaultTheme[field.key];
    hexInput.setAttribute("aria-label", `${field.label} hex value`);

    swatch.addEventListener("input", event => {
      const value = event.target.value.toUpperCase();
      hexInput.value = value;
      handleLivePreview();
    });

    hexInput.addEventListener("input", event => {
      event.target.value = event.target.value.toUpperCase();
    });

    hexInput.addEventListener("change", event => {
      const normalized = normalizeHexColor(event.target.value);
      if (normalized) {
        event.target.value = normalized;
        swatch.value = normalized;
        handleLivePreview();
      } else {
        event.target.value = getFormTheme()[field.key];
      }
    });

    row.append(label, swatch, hexInput);
    return row;
  }

  function createNumberRow(field) {
    const row = createElement("div", "ctp-size-row");
    const label = createElement("label", "ctp-label", field.label);
    label.setAttribute("for", `colorThemePicker_size_${field.key}`);

    const rangeInput = createElement("input", "ctp-size-range");
    rangeInput.type = "range";
    rangeInput.id = `colorThemePicker_size_${field.key}`;
    rangeInput.min = String(field.min);
    rangeInput.max = String(field.max);
    rangeInput.step = String(field.step);
    rangeInput.value = String(defaultTheme[field.key]);

    const numberInput = createElement("input", "ctp-size-value");
    numberInput.type = "number";
    numberInput.id = `colorThemePicker_sizeValue_${field.key}`;
    numberInput.min = String(field.min);
    numberInput.max = String(field.max);
    numberInput.step = String(field.step);
    numberInput.value = String(defaultTheme[field.key]);
    numberInput.setAttribute("aria-label", `${field.label} value in pixels`);

    function updateValue(rawValue) {
      const value = clampNumber(rawValue, field.min, field.max);
      if (value === null) return;
      rangeInput.value = String(value);
      numberInput.value = String(value);
      handleLivePreview();
    }

    rangeInput.addEventListener("input", event => updateValue(event.target.value));
    numberInput.addEventListener("change", event => updateValue(event.target.value));

    row.append(label, rangeInput, numberInput);
    return row;
  }

  function createFontRow(field) {
    const row = createElement("div", "ctp-font-row");
    const label = createElement("label", "ctp-label", field.label);
    label.setAttribute("for", `colorThemePicker_font_${field.key}`);

    const select = createElement("select", "ctp-font-select");
    select.id = `colorThemePicker_font_${field.key}`;

    fontOptions.forEach(([value, labelText]) => {
      const option = createElement("option", "", labelText);
      option.value = value;
      select.appendChild(option);
    });

    select.value = defaultTheme[field.key];
    select.addEventListener("change", handleLivePreview);

    row.append(label, select);
    return row;
  }

  function createActionButton(text, className, handler) {
    const button = createElement("button", className, text);
    button.type = "button";
    button.addEventListener("click", handler);
    return button;
  }

  function createModal() {
    if (getModal()) return;

    injectPickerStyles();

    const modal = createElement("div");
    modal.id = "colorThemePickerModal";
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");
    modal.setAttribute("aria-labelledby", "colorThemePickerTitle");
    modal.hidden = true;

    const card = createElement("div", "ctp-card");
    const header = createElement("div", "ctp-header");
    const titleWrap = createElement("div");

    const title = createElement("h2", "", "Settings");
    title.id = "colorThemePickerTitle";

    const intro = createElement("p", "ctp-intro", "Colors, borders, sizes, and fonts. Changes preview live and are saved locally in this browser.");
    titleWrap.append(title, intro);

    const closeButton = createActionButton("×", "ctp-close", closePicker);
    closeButton.setAttribute("aria-label", "Close settings");
    header.append(titleWrap, closeButton);

    const grid = createElement("div", "ctp-grid");
    grid.id = "colorThemePickerGrid";
    grid.appendChild(createSectionTitle("Colors and borders"));
    colorFields.forEach(field => grid.appendChild(createColorRow(field)));
    grid.appendChild(createSectionTitle("Layout sizes"));
    sizeFields.forEach(field => grid.appendChild(createNumberRow(field)));
    grid.appendChild(createSectionTitle("Fonts"));
    fontFields.forEach(field => grid.appendChild(createFontRow(field)));
    fontSizeFields.forEach(field => grid.appendChild(createNumberRow(field)));

    const actions = createElement("div", "ctp-actions");
    actions.append(
      createActionButton("Reset", "button button-secondary", resetTheme),
      createActionButton("Download settings", "button button-secondary", downloadSavedSettings),
      createActionButton("Close", "button button-secondary", closePicker),
      createActionButton("Save settings", "button ctp-save-button", saveCurrentTheme)
    );

    card.append(header, grid, actions);
    modal.appendChild(card);
    document.body.appendChild(modal);

    document.addEventListener("keydown", event => {
      if (event.key === "Escape" && isOpen) closePicker();
    });
  }

  function getFormTheme() {
    const theme = {};

    colorFields.forEach(field => {
      const swatchInput = document.getElementById(`colorThemePicker_swatch_${field.key}`);
      const hexInput = document.getElementById(`colorThemePicker_hex_${field.key}`);
      const hexValue = normalizeHexColor(hexInput ? hexInput.value : "");
      const swatchValue = normalizeHexColor(swatchInput ? swatchInput.value : "");
      theme[field.key] = hexValue || swatchValue || defaultTheme[field.key];
    });

    [...sizeFields, ...fontSizeFields].forEach(field => {
      const numberInput = document.getElementById(`colorThemePicker_sizeValue_${field.key}`);
      const rangeInput = document.getElementById(`colorThemePicker_size_${field.key}`);
      const numberValue = clampNumber(numberInput ? numberInput.value : null, field.min, field.max);
      const rangeValue = clampNumber(rangeInput ? rangeInput.value : null, field.min, field.max);
      theme[field.key] = numberValue !== null ? numberValue : rangeValue !== null ? rangeValue : defaultTheme[field.key];
    });

    fontFields.forEach(field => {
      const select = document.getElementById(`colorThemePicker_font_${field.key}`);
      theme[field.key] = select && isValidFont(select.value) ? select.value : defaultTheme[field.key];
    });

    return getSafeTheme(theme);
  }

  function setFormTheme(theme) {
    const safeTheme = getSafeTheme(theme);

    colorFields.forEach(field => {
      const swatchInput = document.getElementById(`colorThemePicker_swatch_${field.key}`);
      const hexInput = document.getElementById(`colorThemePicker_hex_${field.key}`);
      if (swatchInput) swatchInput.value = safeTheme[field.key];
      if (hexInput) hexInput.value = safeTheme[field.key];
    });

    [...sizeFields, ...fontSizeFields].forEach(field => {
      const rangeInput = document.getElementById(`colorThemePicker_size_${field.key}`);
      const numberInput = document.getElementById(`colorThemePicker_sizeValue_${field.key}`);
      if (rangeInput) rangeInput.value = String(safeTheme[field.key]);
      if (numberInput) numberInput.value = String(safeTheme[field.key]);
    });

    fontFields.forEach(field => {
      const select = document.getElementById(`colorThemePicker_font_${field.key}`);
      if (select) select.value = safeTheme[field.key];
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
    if (!modal) return;

    const currentTheme = loadTheme();
    setFormTheme(currentTheme);
    applyTheme(currentTheme);
    modal.hidden = false;
    isOpen = true;

    const firstInput = modal.querySelector("input, select");
    if (firstInput) firstInput.focus();
  }

  function closePicker() {
    const modal = getModal();
    if (!modal) return;

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
