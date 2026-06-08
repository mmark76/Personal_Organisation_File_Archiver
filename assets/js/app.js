let selectedParentId = null;
let latestFolderPaths = [];
let nextNodeId = 1;

const thinkingTypes = {
  "001_CHRONOLOGICAL": {
    label: "001 - ΧΡΟΝΙΚΗ",
    prompt: "Δώσε όνομα χρονικής περιόδου",
    examples: ["2024", "2025", "2002-2010_PRIVATE_SECTOR", "2019-NOW_MECI"]
  },
  "002_THEMATIC": {
    label: "002 - ΘΕΜΑΤΙΚΗ",
    prompt: "Δώσε όνομα θέματος",
    examples: ["HEALTH", "FINANCIAL", "INTERESTS", "FAMILY"]
  },
  "003_FUNCTIONAL": {
    label: "003 - ΛΕΙΤΟΥΡΓΙΚΗ",
    prompt: "Δώσε όνομα λειτουργίας",
    examples: ["CV", "APPLICATIONS", "CERTIFICATES", "REFERENCE", "FINAL", "OLD"]
  },
  "004_ROLE_BASED": {
    label: "004 - ΡΟΛΟΥ",
    prompt: "Δώσε όνομα ρόλου",
    examples: ["PROJECT_MANAGER", "PUBLIC_OFFICER", "COORDINATOR", "HEALTH_AND_SAFETY_OFFICER"]
  }
};

const tree = {
  id: "root",
  name: "DOCUMENTS",
  fixed: true,
  children: [
    { id: "profile", name: "01_PROFILE", fixed: true, branch: "profile", children: [], childLayerType: null },
    { id: "personal", name: "02_PERSONAL", fixed: true, branch: "personal", children: [], childLayerType: null },
    { id: "professional", name: "03_PROFESSIONAL", fixed: true, branch: "professional", children: [], childLayerType: null }
  ]
};

function sanitizeFolderName(value) {
  return value
    .trim()
    .replace(/[\\/:*?"<>|]/g, "_")
    .replace(/\s+/g, "_")
    .toUpperCase();
}

function findNode(nodeId, currentNode = tree) {
  if (currentNode.id === nodeId) return currentNode;

  for (const child of currentNode.children || []) {
    const found = findNode(nodeId, child);
    if (found) return found;
  }

  return null;
}

function getBranch(node) {
  if (node.branch) return node.branch;

  const path = getNodePath(node.id);
  const mainNode = path[1];
  return mainNode ? mainNode.branch : null;
}

function getNodePath(nodeId, currentNode = tree, path = []) {
  const currentPath = [...path, currentNode];
  if (currentNode.id === nodeId) return currentPath;

  for (const child of currentNode.children || []) {
    const found = getNodePath(nodeId, child, currentPath);
    if (found.length) return found;
  }

  return [];
}

function getDepth(nodeId) {
  return getNodePath(nodeId).length - 1;
}

function canUseRoleType(parentNode) {
  return getBranch(parentNode) === "professional";
}

function getAllowedThinkingTypes(parentNode) {
  const values = ["001_CHRONOLOGICAL", "002_THEMATIC", "003_FUNCTIONAL"];
  if (canUseRoleType(parentNode)) values.push("004_ROLE_BASED");
  return values;
}

function renderTree() {
  const treeContainer = document.getElementById("treeContainer");
  treeContainer.innerHTML = "";
  treeContainer.appendChild(renderNode(tree, 0));
  updateOutput();
}

function renderNode(node, depth) {
  const wrapper = document.createElement("div");
  wrapper.className = "tree-node-wrapper";

  const row = document.createElement("div");
  row.className = "tree-node";
  row.style.marginLeft = depth * 22 + "px";

  const content = document.createElement("div");
  content.className = "node-content";

  if (node.thinkingType) {
    const type = document.createElement("div");
    type.className = "node-thinking-type";
    type.textContent = "Τύπος: " + thinkingTypes[node.thinkingType].label;
    content.appendChild(type);
  }

  const name = document.createElement("div");
  name.className = "node-name";
  name.textContent = node.name;
  content.appendChild(name);

  if (node.childLayerType) {
    const nextType = document.createElement("div");
    nextType.className = "node-next-layer";
    nextType.textContent = "Το επόμενο layer εδώ είναι: " + thinkingTypes[node.childLayerType].label;
    content.appendChild(nextType);
  }

  const actions = document.createElement("div");
  actions.className = "node-actions";

  if (node.id !== "root") {
    const addButton = document.createElement("button");
    addButton.type = "button";
    addButton.textContent = "+";
    addButton.title = "Add child folder";
    addButton.onclick = () => openNodeModal(node.id);
    actions.appendChild(addButton);
  }

  if (!node.fixed) {
    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.className = "danger small-button";
    deleteButton.textContent = "×";
    deleteButton.title = "Delete folder";
    deleteButton.onclick = () => deleteNode(node.id);
    actions.appendChild(deleteButton);
  }

  row.appendChild(content);
  row.appendChild(actions);
  wrapper.appendChild(row);

  (node.children || []).forEach(child => {
    wrapper.appendChild(renderNode(child, depth + 1));
  });

  return wrapper;
}

function openNodeModal(parentId) {
  selectedParentId = parentId;
  const parentNode = findNode(parentId);
  const modal = document.getElementById("nodeModal");
  const select = document.getElementById("thinkingTypeSelect");
  const fixedType = document.getElementById("fixedThinkingType");
  const context = document.getElementById("modalContext");
  const folderNameInput = document.getElementById("folderNameInput");

  context.textContent = "Parent folder: " + parentNode.name;
  folderNameInput.value = "";

  const allowedTypes = getAllowedThinkingTypes(parentNode);
  Array.from(select.options).forEach(option => {
    option.disabled = !allowedTypes.includes(option.value);
  });

  if (parentNode.childLayerType) {
    select.value = parentNode.childLayerType;
    select.disabled = true;
    fixedType.classList.remove("hidden");
    fixedType.textContent = "This layer already uses: " + thinkingTypes[parentNode.childLayerType].label;
  } else {
    select.disabled = false;
    select.value = allowedTypes[0];
    fixedType.classList.add("hidden");
    fixedType.textContent = "";
  }

  updateThinkingPrompt();
  modal.classList.remove("hidden");
  folderNameInput.focus();
}

function closeNodeModal() {
  selectedParentId = null;
  document.getElementById("nodeModal").classList.add("hidden");
}

function updateThinkingPrompt() {
  const thinkingType = document.getElementById("thinkingTypeSelect").value;
  const typeInfo = thinkingTypes[thinkingType];
  const label = document.getElementById("folderNameLabel");
  const examplesBox = document.getElementById("examplesBox");

  label.textContent = typeInfo.prompt;
  examplesBox.innerHTML = "";

  const title = document.createElement("strong");
  title.textContent = "Παραδείγματα από το δέντρο σου:";
  examplesBox.appendChild(title);

  const list = document.createElement("div");
  list.className = "example-tags";

  typeInfo.examples.forEach(example => {
    const tag = document.createElement("span");
    tag.className = "example-tag";
    tag.textContent = example;
    tag.onclick = () => {
      document.getElementById("folderNameInput").value = example;
    };
    list.appendChild(tag);
  });

  examplesBox.appendChild(list);
}

function confirmAddChild() {
  const parentNode = findNode(selectedParentId);
  const rawName = document.getElementById("folderNameInput").value;
  const cleanName = sanitizeFolderName(rawName);
  const thinkingType = document.getElementById("thinkingTypeSelect").value;

  if (!cleanName) {
    alert("Please enter a folder name.");
    return;
  }

  if (!parentNode.childLayerType) {
    parentNode.childLayerType = thinkingType;
  }

  parentNode.children.push({
    id: "node_" + nextNodeId++,
    name: cleanName,
    fixed: false,
    branch: parentNode.branch || getBranch(parentNode),
    thinkingType: parentNode.childLayerType,
    childLayerType: null,
    children: []
  });

  closeNodeModal();
  renderTree();
}

function deleteNode(nodeId, currentNode = tree) {
  if (!currentNode.children) return false;

  const index = currentNode.children.findIndex(child => child.id === nodeId);
  if (index >= 0) {
    currentNode.children.splice(index, 1);
    if (currentNode.children.length === 0) {
      currentNode.childLayerType = null;
    }
    renderTree();
    return true;
  }

  for (const child of currentNode.children) {
    if (deleteNode(nodeId, child)) return true;
  }

  return false;
}

function buildOutputLines(node, depth = 0, lines = []) {
  const indent = depth === 0 ? "" : "│   ".repeat(Math.max(0, depth - 1)) + "├── ";
  lines.push(indent + node.name);

  (node.children || []).forEach(child => buildOutputLines(child, depth + 1, lines));
  return lines;
}

function buildFolderPaths(node, currentPath = "") {
  const paths = [];
  const nodePath = currentPath ? currentPath + "\\" + node.name : node.name;

  if (node.id !== "root") {
    paths.push(nodePath.replace(/^DOCUMENTS\\?/, ""));
  }

  (node.children || []).forEach(child => {
    paths.push(...buildFolderPaths(child, nodePath));
  });

  return paths.filter(Boolean);
}

function updateOutput() {
  const output = [];
  output.push("Suggested folder structure");
  output.push("");
  output.push("Principle:");
  output.push("- Fixed first level: 01_PROFILE, 02_PERSONAL, 03_PROFESSIONAL");
  output.push("- Unlimited layers below the fixed branches");
  output.push("- Each layer has one thinking type");
  output.push("- The thinking type guides the folder names; it is not a folder");
  output.push("");
  output.push(...buildOutputLines(tree));

  latestFolderPaths = buildFolderPaths(tree);
  document.getElementById("treeOutput").textContent = output.join("\n");
}

function loadMarkellosExample() {
  tree.children[0].childLayerType = "003_FUNCTIONAL";
  tree.children[0].children = [
    createExampleNode("CV", "profile", "003_FUNCTIONAL"),
    createExampleNode("BIOGRAPHY", "profile", "003_FUNCTIONAL"),
    createExampleNode("CERTIFICATES", "profile", "003_FUNCTIONAL"),
    createExampleNode("APPLICATIONS", "profile", "003_FUNCTIONAL"),
    createExampleNode("REFERENCE", "profile", "003_FUNCTIONAL")
  ];

  tree.children[1].childLayerType = "002_THEMATIC";
  tree.children[1].children = [
    createExampleNode("FAMILY", "personal", "002_THEMATIC"),
    createExampleNode("HEALTH", "personal", "002_THEMATIC"),
    createExampleNode("FINANCIAL", "personal", "002_THEMATIC"),
    createExampleNode("INTERESTS", "personal", "002_THEMATIC"),
    createExampleNode("LEARNING", "personal", "002_THEMATIC")
  ];

  tree.children[2].childLayerType = "001_CHRONOLOGICAL";
  tree.children[2].children = [
    createExampleNode("2002-01-01_TO_2010-01-31_PRIVATE_SECTOR", "professional", "001_CHRONOLOGICAL"),
    createExampleNode("2010-02-01_TO_2018-12-31_MECIT", "professional", "001_CHRONOLOGICAL"),
    createExampleNode("2019-01-01_TO_NOW_MECI", "professional", "001_CHRONOLOGICAL")
  ];

  renderTree();
}

function createExampleNode(name, branch, thinkingType) {
  return {
    id: "node_" + nextNodeId++,
    name,
    fixed: false,
    branch,
    thinkingType,
    childLayerType: null,
    children: []
  };
}

function downloadFile(filename, content, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function downloadStructureText() {
  const content = document.getElementById("treeOutput").textContent + "\n\nFolder paths:\n" + latestFolderPaths.join("\n");
  downloadFile("suggested_folder_structure.txt", content, "text/plain;charset=utf-8");
}

function downloadWindowsBatch() {
  let content = "";
  content += "@echo off\r\n";
  content += "REM Suggested folder structure creator\r\n";
  content += "REM Review this file before running it.\r\n\r\n";
  latestFolderPaths.forEach(path => {
    content += 'mkdir "' + path + '" 2>nul\r\n';
  });
  content += "\r\necho Done.\r\npause\r\n";

  downloadFile("create_suggested_folder_structure.bat", content, "application/x-bat;charset=utf-8");
}

async function createFoldersOnComputer() {
  if (!window.showDirectoryPicker) {
    alert("This browser does not support direct folder creation. Use Chrome or Edge, or download the Windows .BAT file.");
    return;
  }

  try {
    const rootHandle = await window.showDirectoryPicker();

    for (const folderPath of latestFolderPaths) {
      const parts = folderPath.split("\\").filter(Boolean);
      let currentHandle = rootHandle;

      for (const part of parts) {
        currentHandle = await currentHandle.getDirectoryHandle(part, { create: true });
      }
    }

    alert("Folder structure created successfully.");
  } catch (error) {
    alert("Folder creation was cancelled or failed.");
  }
}

function copyTreeOutput() {
  navigator.clipboard.writeText(document.getElementById("treeOutput").textContent);
}

renderTree();