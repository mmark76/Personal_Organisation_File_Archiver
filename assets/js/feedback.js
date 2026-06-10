/* Feedback mailto behavior. */

window.AppFeedback = (() => {
  const feedbackRecipient = ["markellos.markides", "gmail.com"].join("@");

  function openFeedback() {
    window.AppModals.openModal("feedbackModal");
    const messageInput = document.getElementById("feedbackMessage");
    if (messageInput) messageInput.focus();
  }

  function closeFeedback() {
    window.AppModals.closeModal("feedbackModal");
  }

  function sendFeedback() {
    const messageInput = document.getElementById("feedbackMessage");
    const emailInput = document.getElementById("feedbackEmail");
    const message = messageInput ? messageInput.value.trim() : "";
    const email = emailInput ? emailInput.value.trim() : "";

    if (!message) {
      alert(window.AppMessages.feedbackMissing);
      return;
    }

    const subject = "Personal Memory-Based File Archiver feedback";
    const body = [
      message,
      "",
      email ? `Sender email: ${email}` : "Sender email: Not provided"
    ].join("\n");

    window.location.href = `mailto:${feedbackRecipient}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    closeFeedback();
  }

  return {
    openFeedback,
    closeFeedback,
    sendFeedback
  };
})();