/* Basic accessibility helpers for modals and keyboard behavior. */

window.AppAccessibility = (() => {
  const focusableSelector = [
    "button:not([disabled])",
    "[href]",
    "input:not([disabled])",
    "select:not([disabled])",
    "textarea:not([disabled])",
    "[tabindex]:not([tabindex='-1'])"
  ].join(",");

  function focusFirstElement(container) {
    if (!container) return;
    const focusable = container.querySelector(focusableSelector);
    if (focusable) focusable.focus();
  }

  function storeFocusedElement() {
    window.AppState.state.lastFocusedElement = document.activeElement;
  }

  function restoreFocusedElement() {
    const element = window.AppState.state.lastFocusedElement;
    if (element && typeof element.focus === "function") {
      element.focus();
    }
    window.AppState.state.lastFocusedElement = null;
  }

  function handleEscapeKey(event) {
    if (event.key !== "Escape") return;
    const openModal = document.querySelector(".modal:not([hidden])");
    if (openModal && window.AppModals) {
      window.AppModals.closeModal(openModal.id);
    }
  }

  function bindKeyboardHandlers() {
    document.addEventListener("keydown", handleEscapeKey);
  }

  return {
    focusFirstElement,
    storeFocusedElement,
    restoreFocusedElement,
    bindKeyboardHandlers
  };
})();
