function getWorkflowCompletionActionBox() {
  return document.getElementById("workflowActionBox");
}

function getWorkflowCompletionStatusText() {
  const statusBoxes = document.querySelectorAll("#workflowActionBox .workflow-status");
  return statusBoxes.length ? statusBoxes[statusBoxes.length - 1].textContent : "";
}

function extractWorkflowCompletionValue(label) {
  const statusText = getWorkflowCompletionStatusText();
  const lines = statusText.split("\n");
  const labelIndex = lines.findIndex(line => line.trim().toLowerCase() === label.toLowerCase());
  if (labelIndex >= 0 && lines[labelIndex + 1]) return lines[labelIndex + 1].trim();
  return "";
}

function getWorkflowCompletionFolderCode() {
  const fromStatus = extractWorkflowCompletionValue("Final folder number:");
  if (fromStatus) return fromStatus;

  const archiveResult = document.getElementById("workflowArchiveResult");
  if (!archiveResult) return "";

  const lines = archiveResult.textContent.split("\n");
  const labelIndex = lines.findIndex(line => line.trim().toLowerCase() === "folder number:");
  return labelIndex >= 0 && lines[labelIndex + 1] ? lines[labelIndex + 1].trim() : "";
}

function getWorkflowCompletionDestination() {
  if (typeof getConfirmedDestinationPath === "function") {
    const destination = getConfirmedDestinationPath();
    if (destination) return destination;
  }

  const archiveResult = document.getElementById("workflowArchiveResult");
  if (!archiveResult) return "";

  const lines = archiveResult.textContent.split("\n");
  const labelIndex = lines.findIndex(line => line.trim().toLowerCase() === "destination:");
  return labelIndex >= 0 && lines[labelIndex + 1] ? lines[labelIndex + 1].trim() : "";
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
    button {
      width: auto;
      max-width: 100%;
    }

    .actions,
    .modal-actions,
    .feedback-actions,
    .workflow-final-actions {
      justify-content: flex-start;
      align-items: start;
    }

    .choice-list {
      justify-items: start;
    }

    .choice-button,
    .final-choice-button,
    .workflow-import-button,
    .workflow-action-button,
    .workflow-copy-advice-button,
    .panel-header button,
    .wizard-header button,
    .actions button,
    .modal-actions button,
    .feedback-actions button {
      width: auto !important;
      max-width: 100%;
      justify-self: start;
    }

    .choice-button,
    .final-choice-button {
      display: inline-grid;
    }

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