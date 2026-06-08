let selectedParentId = null;
let latestFolderPaths = [];
let nextNodeId = 1;

const thinkingTypes = {
  "001_CHRONOLOGICAL": {
    label: "001 - CHRONOLOGICAL",
    prompt: "Give a chronological period name",
    examples: ["2024", "2025", "2002-2010_PRIVATE_SECTOR", "2019-NOW_MECI"]
  },
  "002_THEMATIC": {
    label: "002 - THEMATIC",
    prompt: "Give a theme name",
    examples: ["HEALTH", "FINANCIAL", "INTERESTS", "FAMILY"]
  },
  "003_FUNCTIONAL": {
    label: "003 - FUNCTIONAL",
    prompt: "Give a function name",
    examples: ["CV", "APPLICATIONS", "CERTIFICATES", "REFERENCE", "FINAL", "OLD"]
  },
  "004_ROLE_BASED": {
    label: "004 - ROLE-BASED",
    prompt: "Give a role name",
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
  return value.trim().replace(/[\\/:*?"<>|]/g, "_").replace(/\s+/g, "_").toUpperCase();
}

function findNode(nodeId, currentNode = tree) {
  if (currentNode.id === nodeId) return currentNode;

  for (const child of currentNode.children || []) {
    const found = findNode(nodeId, child);
    if (found) return found;
  }

  return null;
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

function getBranch(node) {
  if (node.branch) return node.branch;

  const path = getNodePath(node.id);
  const mainNode = path[1];
  return mainNode ? mainNode.branch : null;
}

function getAllowedThinkingTypes(parentNode) {
  const values = ["001_CHRONOLOGICAL", "002_THEMATIC", "003_FUNCTIONAL"];
  if (getBranch(parentNode) === "professional") values.push("004_ROLE_BASED");
  return values;
}

function renderTree() {
  const treeContainer = document.getElementById("treeContainer");
  treeContainer.innerHTML = "";

  tree.children.forEach(mainCategory => {
    treeContainer.appendChild(renderNode(mainCategory, 0));
  });

  updateOutput();
  updateDestinationOptions();
}

function renderNode(node, depth) {
  const wrapper = document.createElement("div");
  wrapper.className = "tree-node-wrapper";

  const row = document.createElement("div");
  row.className = "tree-node";
  if (node.fixed && node.id !== "root") row.classList.add("main-category-node");
  row.style.marginLeft = depth * 22 + "px";

  const content = document.createElement("div");
  content.className = "node-content";

  if (node.thinkingType) {
    const type = document.createElement("div");
    type.className = "node-thinking-type";
    type.textContent = "Type: " + thinkingTypes[node.thinkingType].label;
    content.appendChild(type);
  }

  const name = document.createElement("div");
  name.className = "node-name";
  name.textContent = node.name;
  content.appendChild(name);

  if (node.childLayerType) {
    const nextType = document.createElement("div");
    nextType.className = "node-next-layer";
    nextType.textContent = "The next layer here is: " + thinkingTypes[node.childLayerType].label;
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

  (node.children || []).forEach(child => wrapper.appendChild(renderNode(child, depth + 1)));
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
  const select = document.getElementById("thinkingTypeSelect");
  if (!select) return;

  const thinkingType = select.value;
  const label = document.getElementById("folderNameLabel");
  const examplesBox = document.getElementById("examplesBox");

  label.textContent = thinkingTypes[thinkingType].prompt;
  examplesBox.innerHTML = "";

  const title = document.createElement("strong");
  title.textContent = "Examples from your tree:";
  examplesBox.appendChild(title);

  const list = document.createElement("div");
  list.className = "example-tags";

  thinkingTypes[thinkingType].examples.forEach(example => {
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
  const cleanName = sanitizeFolderName(document.getElementById("folderNameInput").value);
  const thinkingType = document.getElementById("thinkingTypeSelect").value;

  if (!cleanName) {
    alert("Please enter a folder name.");
    return;
  }

  if (!parentNode.childLayerType) parentNode.childLayerType = thinkingType;

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
    if (currentNode.children.length === 0) currentNode.childLayerType = null;
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
  if (node.id !== "root") paths.push(nodePath.replace(/^DOCUMENTS\\?/, ""));
  (node.children || []).forEach(child => paths.push(...buildFolderPaths(child, nodePath)));
  return paths.filter(Boolean);
}

function getDestinationNodes(node = tree, currentPath = "") {
  const nodePath = currentPath ? currentPath + "\\" + node.name : node.name;
  const destinations = [];

  if (node.id !== "root") {
    destinations.push({
      id: node.id,
      path: nodePath.replace(/^DOCUMENTS\\?/, ""),
      thinkingType: node.thinkingType || ""
    });
  }

  (node.children || []).forEach(child => destinations.push(...getDestinationNodes(child, nodePath)));
  return destinations;
}

function updateDestinationOptions() {
  const select = document.getElementById("destinationNodeSelect");
  if (!select) return;

  const previousValue = select.value;
  const destinations = getDestinationNodes();
  select.innerHTML = "";

  destinations.forEach(destination => {
    const option = document.createElement("option");
    option.value = destination.path;
    const typeText = destination.thinkingType ? " [" + thinkingTypes[destination.thinkingType].label + "]" : "";
    option.textContent = destination.path + typeText;
    select.appendChild(option);
  });

  if (previousValue && Array.from(select.options).some(option => option.value === previousValue)) {
    select.value = previousValue;
  }
}

function updateOutput() {
  const output = [
    "Suggested folder structure",
    "",
    "Principle:",
    "- Fixed first level: 01_PROFILE, 02_PERSONAL, 03_PROFESSIONAL",
    "- Unlimited layers below the fixed branches",
    "- Each layer has one thinking type",
    "- The thinking type guides the folder names; it is not a folder",
    "",
    ...buildOutputLines(tree)
  ];

  latestFolderPaths = buildFolderPaths(tree);
  document.getElementById("treeOutput").textContent = output.join("\n");
}

function previewFileDestination() {
  const fileName = document.getElementById("destinationFileName").value.trim() || "[New file]";
  const destination = document.getElementById("destinationNodeSelect").value || "[Choose a folder from the tree]";
  const reason = document.getElementById("destinationReason").value.trim() || "No reason written yet.";

  const advice = [
    "File destination advice",
    "",
    "File:",
    fileName,
    "",
    "Suggested folder:",
    destination,
    "",
    "Reason / memory clue:",
    reason,
    "",
    "Important:",
    "This is guidance only. The app does not move the file."
  ].join("\n");

  document.getElementById("fileDestinationOutput").textContent = advice;
}

function copyFileAdvice() {
  navigator.clipboard.writeText(document.getElementById("fileDestinationOutput").textContent);
}

function loadMarkellosExample() {
  tree.children[0].childLayerType = "003_FUNCTIONAL";
  tree.children[0].children = ["CV", "BIOGRAPHY", "CERTIFICATES", "APPLICATIONS", "REFERENCE"].map(name => createExampleNode(name, "profile", "003_FUNCTIONAL"));

  tree.children[1].childLayerType = "002_THEMATIC";
  tree.children[1].children = ["FAMILY", "HEALTH", "FINANCIAL", "INTERESTS", "LEARNING"].map(name => createExampleNode(name, "personal", "002_THEMATIC"));

  tree.children[2].childLayerType = "001_CHRONOLOGICAL";
  tree.children[2].children = ["2002-01-01_TO_2010-01-31_PRIVATE_SECTOR", "2010-02-01_TO_2018-12-31_MECIT", "2019-01-01_TO_NOW_MECI"].map(name => createExampleNode(name, "professional", "001_CHRONOLOGICAL"));

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
  let content = "@echo off\r\nREM Suggested folder structure creator\r\nREM Review this file before running it.\r\n\r\n";
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