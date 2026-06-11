/* User-controlled color theme picker. */

window.ColorThemePicker = (() => {
  const storageKey = "organizeYourPcColorTheme";

  const defaultTheme = {
    appBg: "#000000",
    appSurface: "#0a0a0a",
    appSurfaceSoft: "#111111",
    appText: "#f8fafc",
    appMuted: "#d4d4d4",
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
    { key: "appHighlight", label: "Gold highlight", cssVariable: "--custom-highlight" }
  ];

  function isValidHexColor(value) {
    return /^#[0-9a-f]{6}$/i.test(String(value || ""));
  }

  function getSafeTheme(theme) {
    const safeTheme = { ...defaultTheme };

    if (!theme || typeof theme !== "object") {
      return safeTheme;
    }

    fields.forEach(field => {
      if (isValidHexColor(theme[field.key])) {
        safeTheme[field.key] = theme[field.key];
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

    applyExtraHighlightStyles(safeTheme.appHighlight);
  }

  function applyExtraHighlightStyles(highlightColor) {
    let style = document.getElementById("colorThemePickerGeneratedStyles");

    if (!style) {
      style = document.createElement("style");
      style.id = "colorThemePickerGeneratedStyles";
      document.head.appendChild(style);
    }

    style.textContent = `
      .app-brand h1,
      .screen-card h2,
      .choice-card strong,
      .choice-card:hover strong {
        color: ${highlightColor};
      }

      .choice-card {
        border-color: color-mix(in srgb, ${highlightColor} 34%, transparent);
        box-shadow: 0 0 0 1px color-mix(in srgb, ${highlightColor} 8%, transparent), 0 18px 44px rgba(0, 0, 0, 0.35);
      }

      .choice-card:hover,
      .archive-destination-button:hover,
      .archive-destination-button.archive-destination-selected {
        border-color: color-mix(in srgb, ${highlightColor} 82%, transparent);
      }
    `;
  }

  function getModal() {
    return document.getElementById("colorThemePickerModal");
  }

  function createButton() {
    if (document.getElementById("openColorThemePickerButton")) return;

    const headerActions = document.querySelector(".header-actions");
    if (!headerActions) return;

    const button = document.createElement("button");
    button.type = "button";
    button.id = "openColorThemePickerButton";
    button.className = "button button-secondary";
    button.textContent = "Customize App Appearance and Colors";
    button.addEventListener("click", openPicker);

    headerActions.appendChild(button);
  }

  function createModal() {
    if (getModal()) return;

    const modal = document.createElement("div");
    modal.id = "colorThemePickerModal";
    modal.className = "modal";
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");
    modal.setAttribute("aria-labelledby", "colorThemePickerTitle");
    modal.hidden = true;

    const card = document.createElement("div");
    card.className = "modal-card";

    const titleRow = document.createElement("div");
    titleRow.className = "modal-title-row";

    const title = document.createElement("h2");
    title.id = "colorThemePickerTitle";
    title.textContent = "Choose app colors";

    const closeButton = document.createElement("button");
    closeButton.type = "button";
    closeButton.className = "icon-button";
    closeButton.setAttribute("aria-label", "Close color picker");
    closeButton.textContent = "×";
    closeButton.addEventListener("click", closePicker);

    titleRow.append(title, closeButton);

    const intro = document.createElement("p");
    intro.className = "modal-context";
    intro.textContent = "Select colors for the app. Changes are saved locally in this browser.";

    const form = document.createElement("form");
    form.id = "colorThemePickerForm";

    fields.forEach(field => {
      const label = document.createElement("label");
      label.setAttribute("for", `colorThemePicker_${field.key}`);
      label.textContent = field.label;

      const input = document.createElement("input");
      input.type = "color";
      input.id = `colorThemePicker_${field.key}`;
      input.name = field.key;
      input.value = defaultTheme[field.key];
      input.addEventListener("input", handleLivePreview);

      form.append(label, input);
    });

    const actions = document.createElement("div");
    actions.className = "modal-actions";

    const saveButton = document.createElement("button");
    saveButton.type = "button";
    saveButton.className = "button";
    saveButton.textContent = "Save colors";
    saveButton.addEventListener("click", saveCurrentTheme);

    const resetButton = document.createElement("button");
    resetButton.type = "button";
    resetButton.className = "button button-secondary";
    resetButton.textContent = "Reset defaults";
    resetButton.addEventListener("click", resetTheme);

    const cancelButton = document.createElement("button");
    cancelButton.type = "button";
    cancelButton.className = "button button-secondary";
    cancelButton.textContent = "Close";
    cancelButton.addEventListener("click", closePicker);

    actions.append(saveButton, resetButton, cancelButton);
    card.append(titleRow, intro, form, actions);
    modal.appendChild(card);

    modal.addEventListener("click", event => {
      if (event.target === modal) closePicker();
    });

    document.body.appendChild(modal);
  }

  function getFormTheme() {
    const theme = {};

    fields.forEach(field => {
      const input = document.getElementById(`colorThemePicker_${field.key}`);
      theme[field.key] = input && isValidHexColor(input.value) ? input.value : defaultTheme[field.key];
    });

    return getSafeTheme(theme);
  }

  function setFormTheme(theme) {
    const safeTheme = getSafeTheme(theme);

    fields.forEach(field => {
      const input = document.getElementById(`colorThemePicker_${field.key}`);
      if (input) input.value = safeTheme[field.key];
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

    setFormTheme(loadTheme());
    modal.hidden = false;

    const firstInput = modal.querySelector("input[type='color']");
    if (firstInput) firstInput.focus();
  }

  function closePicker() {
    const modal = getModal();
    if (!modal) return;

    setFormTheme(loadTheme());
    applyTheme(loadTheme());
    modal.hidden = true;
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
