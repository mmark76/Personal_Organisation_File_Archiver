/* Draggable and compact settings panel behavior. */

(() => {
  const positionKey = "organizeYourPcSettingsPanelPositionV3";
  const legacyPositionKeys = [
    "organizeYourPcSettingsPanelPosition",
    "organizeYourPcSettingsPanelPositionV2"
  ];

  function getPanelElements() {
    const modal = document.getElementById("colorThemePickerModal");
    if (!modal) return null;

    return {
      modal,
      card: modal.querySelector(".ctp-card"),
      header: modal.querySelector(".ctp-header"),
      actions: modal.querySelector(".ctp-actions")
    };
  }

  function injectStyles() {
    document.getElementById("settingsPanelPositionStyles")?.remove();

    if (document.getElementById("settingsPanelEnhancementStyles")) return;

    const style = document.createElement("style");
    style.id = "settingsPanelEnhancementStyles";
    style.textContent = `
      #colorThemePickerModal {
        position: absolute !important;
        right: 18px;
        bottom: auto !important;
      }

      #colorThemePickerModal .ctp-card {
        max-height: min(56vh, 360px) !important;
        overflow-y: auto !important;
      }

      #colorThemePickerModal .ctp-header {
        cursor: grab;
        user-select: none;
        touch-action: none;
      }

      #colorThemePickerModal .ctp-header:active {
        cursor: grabbing;
      }

      @media (max-width: 720px) {
        #colorThemePickerModal {
          right: 12px;
        }

        #colorThemePickerModal .ctp-card {
          max-height: min(54vh, 330px) !important;
        }
      }
    `;
    document.head.appendChild(style);
  }

  function setPanelPosition(modal, left, top) {
    modal.style.setProperty("position", "absolute", "important");
    modal.style.setProperty("left", `${Math.round(left)}px`, "important");
    modal.style.setProperty("top", `${Math.round(top)}px`, "important");
    modal.style.setProperty("right", "auto", "important");
    modal.style.setProperty("bottom", "auto", "important");
  }

  function alignWithHeader(modal) {
    const headerPanel = document.querySelector(".app-header-inner");
    const headerTop = headerPanel
      ? headerPanel.getBoundingClientRect().top + window.scrollY
      : window.scrollY + 12;
    const left = window.scrollX + window.innerWidth - modal.offsetWidth - 18;

    setPanelPosition(
      modal,
      Math.max(window.scrollX + 8, left),
      Math.max(window.scrollY + 8, headerTop)
    );
  }

  function restorePosition(modal) {
    try {
      const saved = JSON.parse(localStorage.getItem(positionKey) || "null");
      if (!saved || !Number.isFinite(saved.left) || !Number.isFinite(saved.top)) return false;
      setPanelPosition(modal, saved.left, saved.top);
      return true;
    } catch (error) {
      localStorage.removeItem(positionKey);
      return false;
    }
  }

  function savePosition(modal) {
    const left = Number.parseFloat(modal.style.left);
    const top = Number.parseFloat(modal.style.top);
    if (!Number.isFinite(left) || !Number.isFinite(top)) return;

    localStorage.setItem(positionKey, JSON.stringify({ left, top }));
  }

  function replaceHeaderToRemoveLegacyDragListeners(elements) {
    const replacement = elements.header.cloneNode(true);
    elements.header.replaceWith(replacement);

    const closeButton = replacement.querySelector(".ctp-close");
    closeButton?.addEventListener("click", () => window.ColorThemePicker?.closePicker?.());

    elements.header = replacement;
  }

  function bindDragging(elements) {
    const { modal, header } = elements;
    let dragging = false;
    let offsetX = 0;
    let offsetY = 0;
    let pointerId = null;

    header.addEventListener("pointerdown", event => {
      if (event.button !== 0 || event.target.closest("button, input, select, textarea, a")) return;

      const bounds = modal.getBoundingClientRect();
      dragging = true;
      pointerId = event.pointerId;
      offsetX = event.clientX - bounds.left;
      offsetY = event.clientY - bounds.top;
      event.preventDefault();
    });

    window.addEventListener("pointermove", event => {
      if (!dragging || event.pointerId !== pointerId) return;

      const minimumLeft = window.scrollX + 8;
      const minimumTop = window.scrollY + 8;
      const maximumLeft = Math.max(
        minimumLeft,
        window.scrollX + window.innerWidth - modal.offsetWidth - 8
      );
      const maximumTop = Math.max(
        minimumTop,
        window.scrollY + window.innerHeight - 48
      );
      const requestedLeft = event.clientX + window.scrollX - offsetX;
      const requestedTop = event.clientY + window.scrollY - offsetY;

      setPanelPosition(
        modal,
        Math.min(maximumLeft, Math.max(minimumLeft, requestedLeft)),
        Math.min(maximumTop, Math.max(minimumTop, requestedTop))
      );
      event.preventDefault();
    }, { passive: false });

    function finishDragging(event) {
      if (!dragging || event.pointerId !== pointerId) return;
      dragging = false;
      pointerId = null;
      savePosition(modal);
    }

    window.addEventListener("pointerup", finishDragging);
    window.addEventListener("pointercancel", finishDragging);
  }

  function addResetPositionButton(elements) {
    document.getElementById("resetSettingsPanelPositionButton")?.remove();
    if (!elements.actions) return;

    const button = document.createElement("button");
    button.type = "button";
    button.id = "resetSettingsPanelPositionButton";
    button.className = "button button-secondary";
    button.textContent = "Reset panel position";
    button.addEventListener("click", () => {
      localStorage.removeItem(positionKey);
      alignWithHeader(elements.modal);
    });
    elements.actions.appendChild(button);
  }

  function initializeEnhancements() {
    const elements = getPanelElements();
    if (!elements || !elements.card || !elements.header) return false;
    if (elements.modal.dataset.enhancedDragReady === "true") return true;

    elements.modal.dataset.enhancedDragReady = "true";
    legacyPositionKeys.forEach(key => localStorage.removeItem(key));
    injectStyles();
    replaceHeaderToRemoveLegacyDragListeners(elements);
    bindDragging(elements);
    addResetPositionButton(elements);

    if (!restorePosition(elements.modal)) alignWithHeader(elements.modal);

    const openButton = document.getElementById("openColorThemePickerButton");
    openButton?.addEventListener("click", () => {
      if (localStorage.getItem(positionKey)) return;
      requestAnimationFrame(() => alignWithHeader(elements.modal));
    });

    window.addEventListener("resize", () => {
      if (!localStorage.getItem(positionKey)) alignWithHeader(elements.modal);
    });

    return true;
  }

  function initialize() {
    if (initializeEnhancements()) return;

    const observer = new MutationObserver(() => {
      if (initializeEnhancements()) observer.disconnect();
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initialize);
  } else {
    initialize();
  }
})();
