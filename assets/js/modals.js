/* Modal open and close behavior. */

window.AppModals = (() => {
  function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;

    window.AppAccessibility.storeFocusedElement();
    modal.hidden = false;
    window.AppAccessibility.focusFirstElement(modal);
  }

  function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;

    modal.hidden = true;
    window.AppAccessibility.restoreFocusedElement();
  }

  function bindModalEvents() {
    document.querySelectorAll(".close-modal-button").forEach(button => {
      button.addEventListener("click", () => closeModal(button.dataset.modalId));
    });

    document.querySelectorAll(".modal").forEach(modal => {
      modal.addEventListener("click", event => {
        if (event.target === modal) closeModal(modal.id);
      });
    });
  }

  return {
    openModal,
    closeModal,
    bindModalEvents
  };
})();
