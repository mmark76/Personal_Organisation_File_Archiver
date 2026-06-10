function cloneFolderNodeForExport(node) {
  return {
    name: node.name,
    fixed: Boolean(node.fixed),
    branch: node.branch || null,
    thinkingType: node.thinkingType || null,
    childLayerType: node.childLayerType || null,
    children: (node.children || []).map(cloneFolderNodeForExport)
  };
}

function downloadStructureJson() {
  const exportData = {
    app: "Organize Your PC",
    type: "personal-memory-based-folder-tree",
    schemaVersion: 1,
    exportedAt: new Date().toISOString(),
    folderTree: cloneFolderNodeForExport(tree)
  };

  downloadFile(
    "folder_tree_template.json",
    JSON.stringify(exportData, null, 2),
    "application/json;charset=utf-8"
  );
}

function setupStructureActionLabels() {
  const structureActions = document.querySelector(".structure-section .actions");
  if (!structureActions) return;

  const copyButton = structureActions.querySelector('button[onclick="copyTreeOutput()"]');
  if (copyButton) copyButton.textContent = "Copy Folder Tree";

  const textDownloadButton = structureActions.querySelector('button[onclick="downloadStructureText()"]');
  if (textDownloadButton) textDownloadButton.remove();

  const exportButton = structureActions.querySelector('button[onclick="downloadStructureJson()"]');
  if (exportButton) exportButton.textContent = "Export Folder Tree";

  const createButton = structureActions.querySelector('button[onclick="createFoldersOnComputer()"]');
  if (createButton) createButton.textContent = "Create Folder Tree on PC";
}

function setupStructureJsonImportControls() {
  const structureActions = document.querySelector(".structure-section .actions");
  if (!structureActions || document.getElementById("jsonImportInput")) return;

  setupStructureActionLabels();

  const importButton = document.createElement("button");
  importButton.type = "button";
  importButton.className = "secondary";
  importButton.textContent = "Import Folder Tree";
  importButton.addEventListener("click", openStructureJsonImport);

  const input = document.createElement("input");
  input.type = "file";
  input.id = "jsonImportInput";
  input.className = "hidden";
  input.accept = "application/json,.json";
  input.addEventListener("change", handleStructureJsonImport);

  const exportButton = structureActions.querySelector('button[onclick="downloadStructureJson()"]');
  if (exportButton) {
    structureActions.insertBefore(importButton, exportButton);
  } else {
    const createFoldersButton = structureActions.querySelector(".success");
    if (createFoldersButton) {
      structureActions.insertBefore(importButton, createFoldersButton);
    } else {
      structureActions.appendChild(importButton);
    }
  }

  structureActions.insertAdjacentElement("afterend", input);
}

function openStructureJsonImport() {
  const input = document.getElementById("jsonImportInput");
  if (!input) return;

  input.value = "";
  input.click();
}

async function handleStructureJsonImport(event) {
  const input = event.target;
  const file = input.files && input.files[0];
  if (!file) return;

  try {
    const text = await file.text();
    const data = JSON.parse(text);
    importFolderTreeTemplate(data);
    alert("Folder tree JSON imported successfully.");
  } catch (error) {
    alert("Import failed. Please choose a valid folder_tree_template.json file exported from this app.");
  }
}

function importFolderTreeTemplate(data) {
  if (!data || data.type !== "personal-memory-based-folder-tree" || data.schemaVersion !== 1) {
    throw new Error("Unsupported folder tree template.");
  }

  if (!data.folderTree || data.folderTree.name !== "DOCUMENTS" || !Array.isArray(data.folderTree.children)) {
    throw new Error("Invalid folder tree template.");
  }

  nextNodeId = 1;
  selectedParentId = null;
  destinationCurrentNodeId = null;

  tree.name = "DOCUMENTS";
  tree.fixed = true;
  tree.children = data.folderTree.children.map(importFolderNode);

  renderTree();
  analyzeCurrentFileData();
}

function importFolderNode(node) {
  if (!node || typeof node.name !== "string") {
    throw new Error("Invalid folder node.");
  }

  const branch = typeof node.branch === "string" ? node.branch : null;

  return {
    id: getImportedNodeId(node.name, branch),
    name: node.name,
    fixed: Boolean(node.fixed),
    branch,
    thinkingType: isValidThinkingType(node.thinkingType) ? node.thinkingType : null,
    childLayerType: isValidThinkingType(node.childLayerType) ? node.childLayerType : null,
    children: Array.isArray(node.children) ? node.children.map(importFolderNode) : []
  };
}

function getImportedNodeId(name, branch) {
  if (name === "01_PROFILE" || branch === "profile") return "profile";
  if (name === "02_PERSONAL" || branch === "personal") return "personal";
  if (name === "03_PROFESSIONAL" || branch === "professional") return "professional";
  return "node_" + nextNodeId++;
}

function isValidThinkingType(value) {
  return Boolean(value && thinkingTypes[value]);
}

document.addEventListener("DOMContentLoaded", setupStructureJsonImportControls);