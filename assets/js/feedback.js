function openFeedbackModal() {
  const modal = document.getElementById("feedbackModal");
  const messageInput = document.getElementById("feedbackMessage");

  if (!modal) return;

  modal.classList.remove("hidden");

  if (messageInput) {
    messageInput.focus();
  }
}

function closeFeedbackModal() {
  const modal = document.getElementById("feedbackModal");

  if (!modal) return;

  modal.classList.add("hidden");
}

function sendFeedback() {
  const messageInput = document.getElementById("feedbackMessage");
  const emailInput = document.getElementById("feedbackEmail");

  const message = messageInput ? messageInput.value.trim() : "";
  const email = emailInput ? emailInput.value.trim() : "";

  if (!message) {
    alert("Please write your feedback message before sending.");
    return;
  }

  const subject = "Feedback for Personal Memory-Based File Advisor";
  const bodyLines = [
    "Feedback message:",
    message,
    "",
    "Sender email:",
    email || "Not provided"
  ];

  const mailtoUrl =
    "mailto:markellos.markides@gmail.com" +
    "?subject=" + encodeURIComponent(subject) +
    "&body=" + encodeURIComponent(bodyLines.join("\n"));

  window.location.href = mailtoUrl;
}

document.addEventListener("keydown", event => {
  if (event.key === "Escape") {
    closeFeedbackModal();
  }
});

document.addEventListener("click", event => {
  const feedbackModal = document.getElementById("feedbackModal");

  if (!feedbackModal || feedbackModal.classList.contains("hidden")) return;

  if (event.target === feedbackModal) {
    closeFeedbackModal();
  }
});