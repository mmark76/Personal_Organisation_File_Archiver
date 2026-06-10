function openInfoModal(modalId) {
  const modal = document.getElementById(modalId);
  if (!modal) return;
  modal.classList.remove("hidden");
}

function closeInfoModal(modalId) {
  const modal = document.getElementById(modalId);
  if (!modal) return;
  modal.classList.add("hidden");
}

document.addEventListener("keydown", event => {
  if (event.key !== "Escape") return;
  document.querySelectorAll(".modal:not(.hidden)").forEach(modal => {
    if (modal.id === "importantDisclaimerModal" || modal.id === "howThisAppWorksModal") {
      modal.classList.add("hidden");
    }
  });
});