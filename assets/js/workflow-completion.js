function getWorkflowCompletionActionBox() {
  return document.getElementById("workflowActionBox");
}

function getWorkflowCompletionFolderCode() {
  if (!window.confirmedDestinationNodeId || typeof getWorkflowFolderCode !== "function") return "";
  return getWorkflowFolderCode(window.confirmedDestinationNodeId);
}

function getWorkflowCompletionDestination() {
  if (!window.confirmedDestinationNodeId || typeof getConfirmedDestinationPath !== "function") return "";
  return getConfirmedDestinationPath();
}

function showWorkflowCompletionMessage(actionLabel, details) {
  const actionBox = getWorkflowCompletionActionBox();
  if (!actionBox) return;

  let completionBox = document.getElementById("workflowCompletionMessage");
  if (!completionBox) {
    completionBox = document.createElement("div");
    completionBox.id = "workflowCompletionMessage";
    completionBox.className = "workflow-completion-message";
    actionBox.appendChild(completionBox);
  }

  const lines = [
    "Workflow completed.",
    "",
    "Final action: " + actionLabel,
    "Folder number: " + getWorkflowCompletionFolderCode(),
    "Destination: " + getWorkflowCompletionDestination()
  ];

  if (details) {
    lines.push("", details);
  }

  completionBox.textContent = lines.join("\n");
}

function injectWorkflowCompletionStyles() {
  if (document.getElementById("workflowCompletionStyles")) return;

  const style = document.createElement("style");
  style.id = "workflowCompletionStyles";
  style.textContent = `
    .workflow-completion-message {
      white-space: pre-wrap;
      font-size: 13px;
      border-radius: 10px;
      padding: 10px;
      border: 1px solid #86efac;
      background: #dcfce7;
      color: #14532d;
      font-weight: 700;
    }

    body.theme-dark .workflow-completion-message {
      background: #14532d;
      border-color: #22c55e;
      color: #dcfce7;
    }
  `;
  document.head.appendChild(style);
}

(function wrapWorkflowCompletionActions() {
  injectWorkflowCompletionStyles();

  const originalShowFinalAdvice = window.showFinalAdvice;
  if (typeof originalShowFinalAdvice === "function") {
    window.showFinalAdvice = function showFinalAdviceWithCompletion() {
      originalShowFinalAdvice();
      showWorkflowCompletionMessage("Advice generated", "The advice is ready. You may copy it or load another file.");
    };
    showFinalAdvice = window.showFinalAdvice;
  }

  const originalArchiveImportedFileToConfirmedFolder = window.archiveImportedFileToConfirmedFolder;
  if (typeof originalArchiveImportedFileToConfirmedFolder === "function") {
    window.archiveImportedFileToConfirmedFolder = async function archiveImportedFileToConfirmedFolderWithCompletion() {
      await originalArchiveImportedFileToConfirmedFolder();

      const resultBox = document.getElementById("workflowArchiveResult");
      if (!resultBox || !resultBox.textContent.startsWith("Copied file successfully:")) return;

      const copiedFileName = resultBox.textContent.split("\n")[1] || "";
      const details = copiedFileName
        ? "Copied file: " + copiedFileName + "\nThe original file was not moved or deleted."
        : "The file was copied successfully. The original file was not moved or deleted.";

      showWorkflowCompletionMessage("File archived", details);
    };
    archiveImportedFileToConfirmedFolder = window.archiveImportedFileToConfirmedFolder;
  }
})();