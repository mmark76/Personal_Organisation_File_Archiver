let workflowMode = "";
let workflowFileLoaded = false;
let confirmedDestinationNodeId = null;

function getImportedFileObject() {
  return importedFileData && importedFileData.file ? importedFileData.file : null;
}

function getConfirmedDestinationPath() {
  if (!confirmedDestinationNodeId) return "";
  return getNodeFolderPath(confirmedDestinationNodeId);
}

function getWorkflowFolderCode(nodeId) {
  const node = nodeId ? findNode(nodeId) : null;
  if (!node || typeof getFolderDisplayCode !== "function") return "";
  return getFolderDisplayCode(node);
}

function getWorkflowNumberedPath(nodeId) {
  if (!nodeId) return "";
  const code = getWorkflowFolderCode(nodeId);
  const path = getNodeFolderPath(nodeId);
  return code ? code + "  " + path : path;
}

function hasWorkflowFileLoaded() {
  return Boolean(workflowFileLoaded || importedFileData);
}

function isAtMainCategoryStep() {
  return Boolean(hasWorkflowFileLoaded() && !destinationCurrentNodeId);
}

function isChoosingDestinationPath() {
  return Boolean(hasWorkflowFileLoaded() && !confirmedDestinationNodeId);
}

function isFinalDestinationConfirmed() {
  return Boolean(hasWorkflowFileLoaded() && confirmedDestinationNodeId);
}

function openImportedFilePicker() {
  const input = byId("importedFileInput");
  if (input) input.click();
}

function hideAutomaticSuggestionDuringGuidedChoice() {
  const suggestionBox = byId("autoSuggestionBox");
  if (!suggestionBox || !isChoosingDestinationPath()) return;
  suggestionBox.classList.add("hidden");
  suggestionBox.textContent = "";
}

function showMainCategoryChoicesAfterFileLoad() {
  workflowMode = "";
  destinationCurrentNodeId = null;
  confirmedDestinationNodeId = null;
  updateDestinationGuide();

  const breadcrumb = byId("destinationBreadcrumb");
  const question = byId("destinationStepQuestion");
  if (breadcrumb) breadcrumb.textContent = "File loaded.";
  if (question) question.textContent = "Choose one main category for this file: Profile, Personal, or Professional.";

  hideAutomaticSuggestionDuringGuidedChoice();
}

function injectWorkflowModeControls() {
  const destinationPanel = document.querySelector(".destination-panel");
  if (!destinationPanel || document.getElementById("workflowModeCard")) return;

  const card = createTextElement("div", "workflow-mode-card");
  card.id = "workflowModeCard";

  const description = createTextElement("div", "workflow-mode-description");
  description.id = "workflowModeDescription";

  const actionBox = createTextElement("div", "workflow-action-box");
  actionBox.id = "workflowActionBox";

  card.appendChild(description);
  card.appendChild(actionBox);

  destinationPanel.insertBefore(card, destinationPanel.firstElementChild);
  updateWorkflowModePanel();
}

function setWorkflowMode(mode) {
  workflowMode = mode === "advisor" || mode === "archiver" ? mode : "";
  updateWorkflowModePanel();
}

function shouldHideDestinationPanelChild(child, showWorkflowContent) {
  if (child.id === "workflowModeCard") return false;
  if (!showWorkflowContent) return true;

  if (child.classList && child.classList.contains("example-file-card")) return true;
  if (child.id === "importedFileInput") return true;
  if (child.tagName === "LABEL" && child.getAttribute("for") === "importedFileInput") return true;

  if (isChoosingDestinationPath()) {
    return !(child.classList && child.classList.contains("destination-wizard"));
  }

  if (isFinalDestinationConfirmed()) {
    if (child.tagName === "LABEL" && child.getAttribute("for") === "destinationReason") return false;
    if (child.id === "destinationReason") return false;
    return true;
  }

  return false;
}

function updateDestinationPanelVisibility() {
  const destinationPanel = document.querySelector(".destination-panel");
  const card = byId("workflowModeCard");
  if (!destinationPanel || !card) return;

  const showWorkflowContent = hasWorkflowFileLoaded();
  Array.from(destinationPanel.children).forEach(child => {
    child.classList.toggle("hidden", shouldHideDestinationPanelChild(child, showWorkflowContent));
  });

  hideAutomaticSuggestionDuringGuidedChoice();
}

function appendImportFileButton(actionBox) {
  const buttonText = hasWorkflowFileLoaded() ? "Import / Load Another File" : "Import / Load File";
  actionBox.appendChild(createButton(buttonText, openImportedFilePicker, "success workflow-import-button"));
}

function appendFinalActionButtons(actionBox) {
  const actions = createTextElement("div", "workflow-final-actions");
  actions.appendChild(createButton("Advise", showFinalAdvice, "success workflow-action-button"));

  const archiveButton = createButton("Archive", archiveFinalFile, "success workflow-action-button");
  archiveButton.disabled = !getImportedFileObject();
  actions.appendChild(archiveButton);

  actionBox.appendChild(actions);

  if (!getImportedFileObject()) {
    actionBox.appendChild(createTextElement("div", "workflow-note", "Archive requires a real imported file from your computer. The built-in example can be used for advice only."));
  }
}

function showFinalAdvice() {
  workflowMode = "advisor";
  previewFileDestination();

  const actionBox = byId("workflowActionBox");
  if (!actionBox) return;

  let resultBox = byId("workflowAdviceResult");
  if (!resultBox) {
    resultBox = createTextElement("pre", "workflow-archive-result");
    resultBox.id = "workflowAdviceResult";
    actionBox.appendChild(resultBox);
  }

  resultBox.textContent = byId("fileDestinationOutput").textContent;

  if (!byId("workflowCopyAdviceButton")) {
    const copyButton = createButton("Copy Advice", copyFileAdvice, "secondary workflow-copy-advice-button");
    copyButton.id = "workflowCopyAdviceButton";
    actionBox.appendChild(copyButton);
  }
}

function archiveFinalFile() {
  workflowMode = "archiver";
  archiveImportedFileToConfirmedFolder();
}

function updateWorkflowModePanel() {
  const description = byId("workflowModeDescription");
  const actionBox = byId("workflowActionBox");
  if (!description || !actionBox) return;

  actionBox.innerHTML = "";
  updateDestinationPanelVisibility();

  if (!hasWorkflowFileLoaded()) {
    description.textContent = "Start by loading a file from your computer.";
    appendImportFileButton(actionBox);
    return;
  }

  appendImportFileButton(actionBox);

  if (isAtMainCategoryStep()) {
    description.textContent = "File loaded. Choose one main category below.";
    actionBox.appendChild(createTextElement("div", "workflow-status", "Next step: Profile, Personal, or Professional."));
    return;
  }

  if (isChoosingDestinationPath()) {
    description.textContent = "Choose the relevant subcategory until you reach the final folder.";
    actionBox.appendChild(createTextElement("div", "workflow-status", "Current numbered path:\n" + getWorkflowNumberedPath(destinationCurrentNodeId)));
    return;
  }

  description.textContent = "Final folder selected. Choose the final action.";
  actionBox.appendChild(createTextElement("div", "workflow-status", "Final folder number:\n" + getWorkflowFolderCode(confirmedDestinationNodeId) + "\n\nFinal destination:\n" + getConfirmedDestinationPath()));
  appendFinalActionButtons(actionBox);
}

async function archiveImportedFileToConfirmedFolder() {
  const importedFile = getImportedFileObject();
  const destinationPath = getConfirmedDestinationPath();
  const folderCode = getWorkflowFolderCode(confirmedDestinationNodeId);

  if (!importedFile) {
    alert("Please import a real file from your computer first.");
    return;
  }

  if (!destinationPath) {
    alert("Please confirm one final destination folder first.");
    return;
  }

  if (!window.showDirectoryPicker) {
    alert("Archiver Mode requires a browser with File System Access API support, such as Chrome or Edge.");
    return;
  }

  try {
    const rootHandle = await window.showDirectoryPicker({ mode: "readwrite" });
    const destinationHandle = await getOrCreateDirectoryPath(rootHandle, destinationPath);
    const safeFileName = await getAvailableFileName(destinationHandle, importedFile.name);
    const fileHandle = await destinationHandle.getFileHandle(safeFileName, { create: true });
    const writable = await fileHandle.createWritable();
    await writable.write(importedFile);
    await writable.close();

    showWorkflowArchiveResult("Copied file successfully:\n" + safeFileName + "\n\nFolder number:\n" + folderCode + "\n\nDestination:\n" + destinationPath);
  } catch (error) {
    if (error && error.name === "AbortError") {
      showWorkflowArchiveResult("Archiving cancelled by user.");
      return;
    }
    console.error(error);
    showWorkflowArchiveResult("Archiving failed. Please check browser permissions and try again.");
  }
}

async function getOrCreateDirectoryPath(rootHandle, destinationPath) {
  const parts = destinationPath.split("\\").filter(Boolean);
  let currentHandle = rootHandle;

  for (const part of parts) {
    currentHandle = await currentHandle.getDirectoryHandle(part, { create: true });
  }

  return currentHandle;
}

async function getAvailableFileName(directoryHandle, originalName) {
  const parsedName = splitFileName(originalName);
  let candidateName = originalName;
  let counter = 1;

  while (await fileExists(directoryHandle, candidateName)) {
    candidateName = `${parsedName.base}_copy_${counter}${parsedName.extension}`;
    counter += 1;
  }

  return candidateName;
}

async function fileExists(directoryHandle, fileName) {
  try {
    await directoryHandle.getFileHandle(fileName, { create: false });
    return true;
  } catch (error) {
    return false;
  }
}

function splitFileName(fileName) {
  const lastDotIndex = fileName.lastIndexOf(".");
  if (lastDotIndex <= 0) return { base: fileName, extension: "" };
  return {
    base: fileName.slice(0, lastDotIndex),
    extension: fileName.slice(lastDotIndex)
  };
}

function showWorkflowArchiveResult(message) {
  const actionBox = byId("workflowActionBox");
  if (!actionBox) {
    alert(message);
    return;
  }

  let resultBox = byId("workflowArchiveResult");
  if (!resultBox) {
    resultBox = createTextElement("pre", "workflow-archive-result");
    resultBox.id = "workflowArchiveResult";
    actionBox.appendChild(resultBox);
  }

  resultBox.textContent = message;
}

function injectWorkflowModeStyles() {
  if (document.getElementById("workflowModeStyles")) return;

  const style = document.createElement("style");
  style.id = "workflowModeStyles";
  style.textContent = `
    .workflow-mode-card {
      display: grid;
      gap: 10px;
      padding: 14px;
      margin: 0 0 16px;
      border-radius: 14px;
      border: 1px solid #bfdbfe;
      background: #eff6ff;
    }

    .workflow-mode-card select,
    .workflow-import-button,
    .workflow-action-button,
    .workflow-copy-advice-button {
      width: 100%;
    }

    .workflow-mode-description,
    .workflow-note {
      font-size: 13px;
      color: #1e3a8a;
      line-height: 1.45;
    }

    .workflow-action-box,
    .workflow-final-actions {
      display: grid;
      gap: 10px;
    }

    .workflow-status,
    .workflow-archive-result {
      white-space: pre-wrap;
      font-size: 13px;
      border-radius: 10px;
      padding: 10px;
      background: rgba(255, 255, 255, 0.75);
      color: #1e3a8a;
    }

    .workflow-action-button:disabled {
      opacity: 0.55;
      cursor: not-allowed;
    }

    body.theme-dark .workflow-mode-card {
      background: #0f172a;
      border-color: #60a5fa;
    }

    body.theme-dark .workflow-mode-description,
    body.theme-dark .workflow-note,
    body.theme-dark .workflow-status,
    body.theme-dark .workflow-archive-result {
      color: #dbeafe;
    }

    body.theme-dark .workflow-status,
    body.theme-dark .workflow-archive-result {
      background: #020617;
    }
  `;
  document.head.appendChild(style);
}

const originalCreateDestinationChoiceButtonForWorkflow = createDestinationChoiceButton;
createDestinationChoiceButton = function createDestinationChoiceButtonWithFolderNumber(child) {
  const button = originalCreateDestinationChoiceButtonForWorkflow(child);
  const code = getWorkflowFolderCode(child.id);

  if (code) {
    const codeElement = createTextElement("span", "folder-display-code", code);
    codeElement.title = "Folder selection code";
    button.insertBefore(codeElement, button.firstChild);
  }

  return button;
};

const originalUpdateDestinationPromptForWorkflow = updateDestinationPrompt;
updateDestinationPrompt = function updateDestinationPromptWithFolderNumber(breadcrumb, question, currentNode) {
  originalUpdateDestinationPromptForWorkflow(breadcrumb, question, currentNode);
  if (currentNode) breadcrumb.textContent = getWorkflowNumberedPath(currentNode.id);
};

previewFileDestination = function previewFileDestinationWithFolderNumber() {
  const fileName = byId("destinationFileName").value.trim() || "[New file]";
  const nodeId = confirmedDestinationNodeId || destinationCurrentNodeId;
  const destination = nodeId ? getNodeFolderPath(nodeId) : "[No final folder selected]";
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

const originalSelectDestinationNodeForWorkflow = selectDestinationNode;
selectDestinationNode = function selectDestinationNodeWithWorkflow(nodeId) {
  confirmedDestinationNodeId = null;
  originalSelectDestinationNodeForWorkflow(nodeId);
  updateWorkflowModePanel();
};

const originalResetDestinationGuideForWorkflow = resetDestinationGuide;
resetDestinationGuide = function resetDestinationGuideWithWorkflow() {
  workflowMode = "";
  confirmedDestinationNodeId = null;
  originalResetDestinationGuideForWorkflow();
  updateWorkflowModePanel();
};

const originalChooseCurrentAsFinalForWorkflow = chooseCurrentAsFinal;
chooseCurrentAsFinal = function chooseCurrentAsFinalWithWorkflow() {
  originalChooseCurrentAsFinalForWorkflow();
  confirmedDestinationNodeId = destinationCurrentNodeId;
  workflowMode = "";

  const finalBox = byId("finalDestinationBox");
  if (finalBox) {
    finalBox.classList.remove("hidden");
    finalBox.textContent = "Final destination selected: " + getWorkflowNumberedPath(confirmedDestinationNodeId);
  }

  updateWorkflowModePanel();
};

const originalHandleImportedFileForWorkflow = handleImportedFile;
handleImportedFile = async function handleImportedFileWithWorkflow() {
  const input = byId("importedFileInput");
  const file = input && input.files && input.files[0] ? input.files[0] : null;
  await originalHandleImportedFileForWorkflow();
  if (file && importedFileData) {
    importedFileData.file = file;
    workflowFileLoaded = true;
    showMainCategoryChoicesAfterFileLoad();
  }
  updateWorkflowModePanel();
};

if (typeof importExampleCvFile === "function") {
  const originalImportExampleCvFileForWorkflow = importExampleCvFile;
  importExampleCvFile = function importExampleCvFileWithWorkflow() {
    originalImportExampleCvFileForWorkflow();
    workflowFileLoaded = true;
    showMainCategoryChoicesAfterFileLoad();
    updateWorkflowModePanel();
  };
}

window.setWorkflowMode = setWorkflowMode;
window.openImportedFilePicker = openImportedFilePicker;
window.showFinalAdvice = showFinalAdvice;
window.archiveFinalFile = archiveFinalFile;
window.archiveImportedFileToConfirmedFolder = archiveImportedFileToConfirmedFolder;

document.addEventListener("DOMContentLoaded", () => {
  injectWorkflowModeStyles();
  injectWorkflowModeControls();
});