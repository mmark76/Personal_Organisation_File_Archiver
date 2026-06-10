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

function hasWorkflowFileLoaded() {
  return Boolean(workflowFileLoaded || importedFileData);
}

function openImportedFilePicker() {
  const input = byId("importedFileInput");
  if (input) input.click();
}

function injectWorkflowModeControls() {
  const destinationPanel = document.querySelector(".destination-panel");
  if (!destinationPanel || document.getElementById("workflowModeCard")) return;

  const card = createTextElement("div", "workflow-mode-card");
  card.id = "workflowModeCard";

  const label = createTextElement("label", "workflow-mode-label", "Workflow mode");
  label.setAttribute("for", "workflowModeSelect");

  const select = document.createElement("select");
  select.id = "workflowModeSelect";
  select.setAttribute("aria-label", "Choose workflow mode");
  select.onchange = () => setWorkflowMode(select.value);

  const placeholderOption = document.createElement("option");
  placeholderOption.value = "";
  placeholderOption.textContent = "Choose Advisor Mode or Archiver Mode";
  placeholderOption.disabled = true;
  placeholderOption.selected = true;

  const advisorOption = document.createElement("option");
  advisorOption.value = "advisor";
  advisorOption.textContent = "Advisor Mode - suggest only";

  const archiverOption = document.createElement("option");
  archiverOption.value = "archiver";
  archiverOption.textContent = "Archiver Mode - copy after confirmation";

  select.appendChild(placeholderOption);
  select.appendChild(advisorOption);
  select.appendChild(archiverOption);

  const description = createTextElement("div", "workflow-mode-description hidden");
  description.id = "workflowModeDescription";

  const actionBox = createTextElement("div", "workflow-action-box hidden");
  actionBox.id = "workflowActionBox";

  card.appendChild(label);
  card.appendChild(select);
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
  return false;
}

function updateDestinationPanelVisibility() {
  const destinationPanel = document.querySelector(".destination-panel");
  const card = byId("workflowModeCard");
  if (!destinationPanel || !card) return;

  const showWorkflowContent = Boolean(workflowMode && hasWorkflowFileLoaded());
  Array.from(destinationPanel.children).forEach(child => {
    child.classList.toggle("hidden", shouldHideDestinationPanelChild(child, showWorkflowContent));
  });
}

function appendImportFileButton(actionBox) {
  const buttonText = hasWorkflowFileLoaded() ? "Import / Load Another File" : "Import / Load File";
  actionBox.appendChild(createButton(buttonText, openImportedFilePicker, "success workflow-import-button"));
}

function updateWorkflowModePanel() {
  const select = byId("workflowModeSelect");
  const description = byId("workflowModeDescription");
  const actionBox = byId("workflowActionBox");
  if (!select || !description || !actionBox) return;

  select.value = workflowMode;
  actionBox.innerHTML = "";
  updateDestinationPanelVisibility();

  if (!workflowMode) {
    description.classList.add("hidden");
    actionBox.classList.add("hidden");
    return;
  }

  description.classList.remove("hidden");
  actionBox.classList.remove("hidden");

  if (workflowMode === "advisor") {
    description.textContent = "Advisor Mode gives folder suggestions and filing advice only. It does not copy, move, delete, upload, rename, or modify files.";
  } else {
    description.textContent = "Archiver Mode can copy the currently imported file into the confirmed destination folder after you choose a root folder and give browser permission. It does not delete or move the original file.";
  }

  appendImportFileButton(actionBox);

  if (!hasWorkflowFileLoaded()) {
    return;
  }

  if (workflowMode === "advisor") {
    actionBox.appendChild(createTextElement("div", "workflow-status", "Current action: decide and copy advice."));
    return;
  }

  const statusLines = [];
  const importedFile = getImportedFileObject();
  const destinationPath = getConfirmedDestinationPath();

  statusLines.push(importedFile ? "Imported file: " + importedFile.name : "Imported file: loaded without direct copy object");
  statusLines.push(destinationPath ? "Confirmed destination: " + destinationPath : "Confirmed destination: none selected yet");

  const status = createTextElement("div", "workflow-status", statusLines.join("\n"));
  actionBox.appendChild(status);

  const archiveButton = createButton("Copy imported file to confirmed folder", archiveImportedFileToConfirmedFolder, "success workflow-archive-button");
  archiveButton.disabled = !importedFile || !destinationPath;
  actionBox.appendChild(archiveButton);

  const note = createTextElement("div", "workflow-note", "The app will ask you to choose the root folder where the folder tree exists or should be created. Existing files are not overwritten; a safe copy name is created if needed.");
  actionBox.appendChild(note);
}

async function archiveImportedFileToConfirmedFolder() {
  const importedFile = getImportedFileObject();
  const destinationPath = getConfirmedDestinationPath();

  if (!importedFile) {
    alert("Please import a file first.");
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

    showWorkflowArchiveResult("Copied file successfully:\n" + safeFileName + "\n\nDestination:\n" + destinationPath);
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

    .workflow-mode-label {
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      white-space: nowrap;
      border: 0;
    }

    .workflow-mode-card select,
    .workflow-import-button {
      width: 100%;
    }

    .workflow-mode-description,
    .workflow-note {
      font-size: 13px;
      color: #1e3a8a;
      line-height: 1.45;
    }

    .workflow-action-box {
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

    .workflow-archive-button:disabled {
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

const originalSelectDestinationNodeForWorkflow = selectDestinationNode;
selectDestinationNode = function selectDestinationNodeWithWorkflow(nodeId) {
  confirmedDestinationNodeId = null;
  originalSelectDestinationNodeForWorkflow(nodeId);
  updateWorkflowModePanel();
};

const originalResetDestinationGuideForWorkflow = resetDestinationGuide;
resetDestinationGuide = function resetDestinationGuideWithWorkflow() {
  confirmedDestinationNodeId = null;
  originalResetDestinationGuideForWorkflow();
  updateWorkflowModePanel();
};

const originalChooseCurrentAsFinalForWorkflow = chooseCurrentAsFinal;
chooseCurrentAsFinal = function chooseCurrentAsFinalWithWorkflow() {
  originalChooseCurrentAsFinalForWorkflow();
  confirmedDestinationNodeId = destinationCurrentNodeId;
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
  }
  updateWorkflowModePanel();
};

if (typeof importExampleCvFile === "function") {
  const originalImportExampleCvFileForWorkflow = importExampleCvFile;
  importExampleCvFile = function importExampleCvFileWithWorkflow() {
    originalImportExampleCvFileForWorkflow();
    workflowFileLoaded = true;
    updateWorkflowModePanel();
  };
}

window.setWorkflowMode = setWorkflowMode;
window.openImportedFilePicker = openImportedFilePicker;
window.archiveImportedFileToConfirmedFolder = archiveImportedFileToConfirmedFolder;

document.addEventListener("DOMContentLoaded", () => {
  injectWorkflowModeStyles();
  injectWorkflowModeControls();
});