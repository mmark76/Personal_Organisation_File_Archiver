function getWorkflowCompletionActionBox() {
  return document.getElementById("workflowActionBox");
}

function getWorkflowDisplayPath(nodeId) {
  if (!nodeId) return "";
  if (typeof getNodeDisplayFolderPath === "function") return getNodeDisplayFolderPath(nodeId);
  return getNodeFolderPath(nodeId);
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
  const nodeId = typeof confirmedDestinationNodeId !== "undefined" ? confirmedDestinationNodeId : null;
  const displayPath = getWorkflowDisplayPath(nodeId);
  if (displayPath) return displayPath;

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

  getWorkflowNumberedPath = function getWorkflowNumberedPathWithoutDuplicateNumbers(nodeId) {
    if (!nodeId) return "";
    const code = getWorkflowFolderCode(nodeId);
    const path = getWorkflowDisplayPath(nodeId);
    return code ? code + "  " + path : path;
  };

  const originalPreviewFileDestination = previewFileDestination;
  previewFileDestination = function previewFileDestinationWithCleanFolderNames() {
    const fileName = byId("destinationFileName").value.trim() || "[New file]";
    const nodeId = confirmedDestinationNodeId || destinationCurrentNodeId;
    const destination = nodeId ? getWorkflowDisplayPath(nodeId) : "[No final folder selected]";
    const folderCode = nodeId ? getWorkflowFolderCode(nodeId) : "[No folder number]";
    const reason = byId("destinationReason").value.trim() || "No reason written yet.";
    const node = nodeId ? findNode(nodeId) : null;
    const status = confirmedDestinationNodeId || (node && node.children.length === 0) ? "Final folder reached." : "Review whether this is final, or continue one level deeper.";

    const advice = [
      "File destination advice",
      "",
      "File:",
      fileName,
      "",
      "Folder number:",
      folderCode,
      "",
      "Suggested folder:",
      destination,
      "",
      "Status:",
      status,
      "",
      "Reason / memory clue:",
      reason,
      "",
      "Important:",
      "This is guidance only. The app does not move the file."
    ].join("\n");

    byId("fileDestinationOutput").textContent = advice;
  };

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