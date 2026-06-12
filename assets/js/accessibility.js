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

  function getFocusableElements(container) {
    if (!container) return [];

    return Array.from(container.querySelectorAll(focusableSelector)).filter(element => {
      return !element.hidden && element.offsetParent !== null;
    });
  }

  function focusFirstElement(container) {
    if (!container) return;
    const focusable = getFocusableElements(container);

    if (focusable.length > 0) {
      focusable[0].focus();
      return;
    }

    container.setAttribute("tabindex", "-1");
    container.focus();
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

  function handleTabKey(event) {
    if (event.key !== "Tab") return;

    const openModal = document.querySelector(".modal:not([hidden])");
    if (!openModal) return;

    const focusable = getFocusableElements(openModal);
    if (focusable.length === 0) {
      event.preventDefault();
      openModal.focus();
      return;
    }

    const firstElement = focusable[0];
    const lastElement = focusable[focusable.length - 1];
    const activeElement = document.activeElement;

    if (!openModal.contains(activeElement)) {
      event.preventDefault();
      firstElement.focus();
      return;
    }

    if (event.shiftKey && activeElement === firstElement) {
      event.preventDefault();
      lastElement.focus();
      return;
    }

    if (!event.shiftKey && activeElement === lastElement) {
      event.preventDefault();
      firstElement.focus();
    }
  }

  function handleModalKeyboard(event) {
    handleEscapeKey(event);
    handleTabKey(event);
  }

  function bindKeyboardHandlers() {
    document.addEventListener("keydown", handleModalKeyboard);
  }

  return {
    focusFirstElement,
    storeFocusedElement,
    restoreFocusedElement,
    bindKeyboardHandlers
  };
})();