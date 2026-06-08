let selectedParentId = null;
let latestFolderPaths = [];
let nextNodeId = 1;
let destinationCurrentNodeId = null;
let importedFileData = null;

const thinkingTypes = {
  "001_CHRONOLOGICAL": {
    label: "001 - CHRONOLOGICAL",
    prompt: "Give a chronological period name",
    question: "Which time period does this file belong to?",
    examples: ["2024", "2025", "2002-2010_PRIVATE_SECTOR", "2019-NOW_MECI"]
  },
  "002_THEMATIC": {
    label: "002 - THEMATIC",
    prompt: "Give a theme name",
    question: "Which theme best describes this file?",
    examples: ["HEALTH", "FINANCIAL", "INTERESTS", "FAMILY"]
  },
  "003_FUNCTIONAL": {
    label: "003 - FUNCTIONAL",
    prompt: "Give a function name",
    question: "What function does this file serve?",
    examples: ["CVS", "DEGREES", "CERTIFICATES", "REFERENCES", "SUPPORTING_EVIDENCE"]
  },
  "004_ROLE_BASED": {
    label: "004 - ROLE-BASED",
    prompt: "Give a role name",
    question: "Which professional role does this file relate to?",
    examples: ["PROJECT_MANAGER", "PUBLIC_OFFICER", "COORDINATOR", "HEALTH_AND_SAFETY_OFFICER"]
  }
};

const profileKeywordMap = {
  "CVS": ["cv", "cvs", "curriculum", "vitae", "resume", "résumé", "βιογραφικο", "βιογραφικα", "biografiko"],
  "DEGREES": ["degree", "degrees", "diploma", "diplomas", "bachelor", "master", "mba", "university", "πτυχιο", "πτυχια", "ptychio", "ptychia"],
  "CERTIFICATES": ["certificate", "certificates", "certification", "certifications", "license", "licence", "training", "πιστοποιητικο", "πιστοποιητικα", "pistopoiitiko"],
  "REFERENCES": ["reference", "references", "recommendation", "recommendations", "referee", "συστατικη", "συστατικες", "systatiki", "systatikes"],
  "SUPPORTING_EVIDENCE": ["proof", "proofs", "evidence", "verification", "confirmation", "supporting", "supporting evidence", "αποδεικτικο", "αποδεικτικα", "apodeiktiko"],
  "CHESS": ["chess", "tournament", "opening", "game", "pgn", "σκακι", "skaki"],
  "SWIMMING": ["swimming", "swim", "pool", "sea", "κολυμπι", "kolympi"],
  "MNEMONIC_TECHNIQUES": ["mnemonic", "memory", "memory palace", "loci", "mnemonics", "μνημονικες", "mnimonikes"],
  "BLOG_WRITING": ["blog", "article", "writing", "post", "blogger", "αρθρο", "arthro"],
  "WEB_APPS": ["web app", "app", "javascript", "html", "css", "github", "cursor"]
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

function normalizeText(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

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

function findParentNode(nodeId, currentNode = tree) {
  for (const child of currentNode.children || []) {
    if (child.id === nodeId) return currentNode;
    const found = findParentNode(nodeId, child);
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
  tree.children.forEach(mainCategory => treeContainer.appendChild(renderNode(mainCategory, 0)));
  updateOutput();
  updateDestinationGuide();
}

function renderNode(node, depth) {
  const wrapper = document.createElement("div");
  wrapper.className = "tree-node-wrapper";

  const row = document.createElement("div");
  row.className = "tree-node";
  if (node.fixed && node.id !== "root") row.classList.add("main-category-node");
  if (node.id === destinationCurrentNodeId) row.classList.add("selected-destination-node");
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
    nextType.textContent = "Next layer: " + thinkingTypes[node.childLayerType].label;
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

  thinkingTypes[thinkingType].examples.forEach(example => {
    const tag = document.createElement("span");
    tag.className = "example-tag";
    tag.textContent = example;
    tag.onclick = () => { document.getElementById("folderNameInput").value = example; };
    examplesBox.appendChild(tag);
  });
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

  parentNode.children.push(createExampleNode(cleanName, parentNode.branch || getBranch(parentNode), parentNode.childLayerType));
  closeNodeModal();
  renderTree();
  analyzeCurrentFileData();
}

function deleteNode(nodeId, currentNode = tree) {
  if (!currentNode.children) return false;

  const index = currentNode.children.findIndex(child => child.id === nodeId);
  if (index >= 0) {
    currentNode.children.splice(index, 1);
    if (destinationCurrentNodeId === nodeId) destinationCurrentNodeId = null;
    if (currentNode.children.length === 0) currentNode.childLayerType = null;
    renderTree();
    analyzeCurrentFileData();
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

function getNodeFolderPath(nodeId) {
  return getNodePath(nodeId)
    .filter(node => node.id !== "root")
    .map(node => node.name)
    .join("\\");
}

function resetDestinationGuide() {
  destinationCurrentNodeId = null;
  updateDestinationGuide();
  renderTree();
}

function selectDestinationNode(nodeId) {
  destinationCurrentNodeId = nodeId;
  updateDestinationGuide();
  renderTree();
}

function chooseCurrentAsFinal() {
  const finalBox = document.getElementById("finalDestinationBox");
  const node = findNode(destinationCurrentNodeId);
  if (!node) return;
  finalBox.classList.remove("hidden");
  finalBox.textContent = "Final destination selected: " + getNodeFolderPath(node.id);
}

function updateDestinationGuide() {
  const breadcrumb = document.getElementById("destinationBreadcrumb");
  const question = document.getElementById("destinationStepQuestion");
  const choices = document.getElementById("destinationChoices");
  const finalBox = document.getElementById("finalDestinationBox");
  if (!breadcrumb || !question || !choices || !finalBox) return;

  const currentNode = destinationCurrentNodeId ? findNode(destinationCurrentNodeId) : null;
  const availableChildren = currentNode ? currentNode.children : tree.children;

  finalBox.classList.add("hidden");
  finalBox.textContent = "";
  choices.innerHTML = "";

  if (!currentNode) {
    breadcrumb.textContent = "No folder selected yet.";
    question.textContent = "Start by choosing one of the main categories.";
  } else {
    breadcrumb.textContent = getNodeFolderPath(currentNode.id);
    if (currentNode.children.length > 0) {
      const nextType = currentNode.childLayerType ? thinkingTypes[currentNode.childLayerType] : null;
      question.textContent = nextType ? nextType.question : "Choose the next folder.";
    } else {
      question.textContent = "This is a final folder unless you add more child folders on the left.";
    }
  }

  availableChildren.forEach(child => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "choice-button";
    button.onclick = () => selectDestinationNode(child.id);

    const name = document.createElement("strong");
    name.textContent = child.name;
    button.appendChild(name);

    if (child.thinkingType) {
      const type = document.createElement("span");
      type.textContent = thinkingTypes[child.thinkingType].label;
      button.appendChild(type);
    }

    choices.appendChild(button);
  });

  if (currentNode) {
    const finalButton = document.createElement("button");
    finalButton.type = "button";
    finalButton.className = "final-choice-button";
    finalButton.textContent = currentNode.children.length > 0 ? "Use this folder as final destination" : "Confirm this final folder";
    finalButton.onclick = chooseCurrentAsFinal;
    choices.appendChild(finalButton);

    const parentNode = findParentNode(currentNode.id);
    if (parentNode && parentNode.id !== "root") {
      const backButton = document.createElement("button");
      backButton.type = "button";
      backButton.className = "secondary choice-button";
      backButton.textContent = "Go back one level";
      backButton.onclick = () => selectDestinationNode(parentNode.id);
      choices.appendChild(backButton);
    } else if (parentNode && parentNode.id === "root") {
      const backButton = document.createElement("button");
      backButton.type = "button";
      backButton.className = "secondary choice-button";
      backButton.textContent = "Back to main categories";
      backButton.onclick = resetDestinationGuide;
      choices.appendChild(backButton);
    }
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
    "DOCUMENTS",
    ...tree.children.flatMap(child => buildOutputLines(child, 1))
  ];

  latestFolderPaths = buildFolderPaths(tree);
  document.getElementById("treeOutput").textContent = output.join("\n");
}

async function handleImportedFile() {
  const input = document.getElementById("importedFileInput");
  const file = input.files && input.files[0];
  if (!file) return;

  importedFileData = {
    name: file.name,
    type: file.type || "unknown",
    size: file.size,
    lastModified: new Date(file.lastModified).toISOString().slice(0, 10),
    text: ""
  };

  document.getElementById("destinationFileName").value = file.name;

  if (isTextReadableFile(file)) {
    try {
      importedFileData.text = (await file.text()).slice(0, 12000);
    } catch (error) {
      importedFileData.text = "";
    }
  }

  updateFileAnalysisBox();
  analyzeCurrentFileData();
}

function isTextReadableFile(file) {
  const name = file.name.toLowerCase();
  const type = (file.type || "").toLowerCase();
  return type.startsWith("text/") || /\.(txt|md|csv|json|html|htm|xml|rtf)$/i.test(name);
}

function updateFileAnalysisBox() {
  const box = document.getElementById("fileAnalysisBox");
  if (!box || !importedFileData) return;

  const textStatus = importedFileData.text ? "Text content was read and included in keyword matching." : "Only filename and browser metadata were available for keyword matching.";
  box.textContent = [
    "Imported file:",
    importedFileData.name,
    "",
    "Browser metadata:",
    "Type: " + importedFileData.type,
    "Size: " + Math.round(importedFileData.size / 1024) + " KB",
    "Modified: " + importedFileData.lastModified,
    "",
    textStatus
  ].join("\n");
}

function analyzeCurrentFileData() {
  const suggestionBox = document.getElementById("autoSuggestionBox");
  if (!suggestionBox) return;

  const fileName = document.getElementById("destinationFileName").value.trim();
  const analysisText = buildAnalysisText(fileName);
  const suggestion = suggestBestFolder(analysisText);

  if (!suggestion) {
    suggestionBox.classList.add("hidden");
    suggestionBox.textContent = "";
    return;
  }

  suggestionBox.classList.remove("hidden");
  suggestionBox.innerHTML = "";

  const title = document.createElement("strong");
  title.textContent = "Automatic suggestion";
  suggestionBox.appendChild(title);

  const text = document.createElement("div");
  text.textContent = suggestion.path + " — confidence: " + suggestion.confidence;
  suggestionBox.appendChild(text);

  const reason = document.createElement("div");
  reason.className = "suggestion-reason";
  reason.textContent = "Matched keywords: " + suggestion.matches.join(", ");
  suggestionBox.appendChild(reason);

  const applyButton = document.createElement("button");
  applyButton.type = "button";
  applyButton.textContent = "Use suggested folder";
  applyButton.onclick = () => selectDestinationNode(suggestion.nodeId);
  suggestionBox.appendChild(applyButton);
}

function buildAnalysisText(fileName) {
  const parts = [fileName || ""];
  if (importedFileData) {
    parts.push(importedFileData.name || "");
    parts.push(importedFileData.type || "");
    parts.push(importedFileData.lastModified || "");
    parts.push(importedFileData.text || "");
  }
  return normalizeText(parts.join(" "));
}

function suggestBestFolder(analysisText) {
  if (!analysisText.trim()) return null;

  const candidates = getDestinationCandidates();
  let best = null;

  candidates.forEach(candidate => {
    const normalizedPath = normalizeText(candidate.path);
    const keywords = buildCandidateKeywords(candidate);
    const matches = keywords.filter(keyword => analysisText.includes(keyword));
    let score = matches.length;

    if (candidate.node.children.length === 0) score += 0.75;
    if (normalizedPath.includes("01_profile")) score += score > 0 ? 1 : 0;
    if (normalizedPath.includes("cvs") && /cv|resume|curriculum|vitae|βιογραφικο|βιογραφικα|biografiko/.test(analysisText)) score += 3;
    if (normalizedPath.includes("degrees") && /degree|diploma|bachelor|master|mba|university|πτυχιο|πτυχια|ptychio|ptychia/.test(analysisText)) score += 3;
    if (normalizedPath.includes("certificates") && /certificate|certification|license|licence|training|πιστοποιητικο|πιστοποιητικα|pistopoiitiko/.test(analysisText)) score += 3;
    if (normalizedPath.includes("references") && /reference|recommendation|referee|συστατικη|συστατικες|systatiki|systatikes/.test(analysisText)) score += 3;
    if (normalizedPath.includes("supporting_evidence") && /proof|evidence|verification|confirmation|supporting|αποδεικτικο|αποδεικτικα|apodeiktiko/.test(analysisText)) score += 3;
    if (normalizedPath.includes("chess") && /chess|tournament|opening|game|pgn|σκακι|skaki/.test(analysisText)) score += 3;
    if (normalizedPath.includes("swimming") && /swimming|swim|pool|sea|κολυμπι|kolympi/.test(analysisText)) score += 3;
    if (normalizedPath.includes("mnemonic") && /mnemonic|memory|loci|μνημονικες|mnimonikes/.test(analysisText)) score += 3;
    if (normalizedPath.includes("blog") && /blog|article|writing|post|blogger|αρθρο|arthro/.test(analysisText)) score += 3;
    if (normalizedPath.includes("web_apps") && /web app|javascript|html|css|github|cursor/.test(analysisText)) score += 3;
    if (normalizedPath.includes("financial") && /invoice|receipt|bank|tax|payment|financial/.test(analysisText)) score += 2;
    if (normalizedPath.includes("health") && /health|medical|doctor|hospital|clinic|blood/.test(analysisText)) score += 2;
    if (normalizedPath.includes("professional") && /work|project|ministry|meci|report|meeting|professional/.test(analysisText)) score += 1.5;

    if (score > 0 && (!best || score > best.score)) {
      best = { ...candidate, score, matches: matches.slice(0, 8) };
    }
  });

  if (!best) return null;

  return {
    nodeId: best.node.id,
    path: best.path,
    confidence: best.score >= 5 ? "high" : best.score >= 3 ? "medium" : "low",
    matches: best.matches.length ? best.matches : ["multilingual pattern"]
  };
}

function getDestinationCandidates(node = tree, currentPath = "") {
  const nodePath = currentPath ? currentPath + "\\" + node.name : node.name;
  const candidates = [];

  if (node.id !== "root") {
    candidates.push({ node, path: nodePath.replace(/^DOCUMENTS\\?/, "") });
  }

  (node.children || []).forEach(child => candidates.push(...getDestinationCandidates(child, nodePath)));
  return candidates;
}

function buildCandidateKeywords(candidate) {
  const pathWords = candidate.path.split(/[\\_\-\s.]+/).filter(word => word.length >= 2);
  const nodeWords = candidate.node.name.split(/[\\_\-\s.]+/).filter(word => word.length >= 2);
  const mappedWords = profileKeywordMap[candidate.node.name] || [];
  const normalized = [...pathWords, ...nodeWords, ...mappedWords].map(word => normalizeText(word));
  return [...new Set(normalized)];
}

function previewFileDestination() {
  const fileName = document.getElementById("destinationFileName").value.trim() || "[New file]";
  const destination = destinationCurrentNodeId ? getNodeFolderPath(destinationCurrentNodeId) : "[No final folder selected]";
  const reason = document.getElementById("destinationReason").value.trim() || "No reason written yet.";
  const node = destinationCurrentNodeId ? findNode(destinationCurrentNodeId) : null;
  const status = node && node.children.length === 0 ? "Final folder reached." : "Review whether this is final, or continue one level deeper.";

  const advice = [
    "File destination advice",
    "",
    "File:",
    fileName,
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

  document.getElementById("fileDestinationOutput").textContent = advice;
}

function copyFileAdvice() {
  navigator.clipboard.writeText(document.getElementById("fileDestinationOutput").textContent);
}

function loadMarkellosExample() {
  tree.children[0].childLayerType = "003_FUNCTIONAL";
  tree.children[0].children = ["CVS", "DEGREES", "CERTIFICATES", "REFERENCES", "SUPPORTING_EVIDENCE"].map(name => createExampleNode(name, "profile", "003_FUNCTIONAL"));

  tree.children[1].childLayerType = "002_THEMATIC";
  tree.children[1].children = [
    createExampleNode("FAMILY", "personal", "002_THEMATIC"),
    createExampleNode("HEALTH", "personal", "002_THEMATIC"),
    createExampleNode("FINANCIAL", "personal", "002_THEMATIC"),
    createExampleNode("INTERESTS", "personal", "002_THEMATIC", "002_THEMATIC", [
      createExampleNode("CHESS", "personal", "002_THEMATIC"),
      createExampleNode("SWIMMING", "personal", "002_THEMATIC"),
      createExampleNode("MNEMONIC_TECHNIQUES", "personal", "002_THEMATIC"),
      createExampleNode("BLOG_WRITING", "personal", "002_THEMATIC"),
      createExampleNode("WEB_APPS", "personal", "002_THEMATIC")
    ]),
    createExampleNode("LEARNING", "personal", "002_THEMATIC")
  ];

  tree.children[2].childLayerType = "001_CHRONOLOGICAL";
  tree.children[2].children = [
    "2002-2010_PRIVATE_SECTOR",
    "2010-2019_MARINAS_PPP_DBFOT",
    "2019-2026_STATE_FAIR_SITE_MANAGEMENT",
    "2026-NOW_HEALTH_AND_SAFETY_OFFICER"
  ].map(name => createExampleNode(name, "professional", "001_CHRONOLOGICAL"));

  renderTree();
  analyzeCurrentFileData();
}

function createExampleNode(name, branch, thinkingType, childLayerType = null, children = []) {
  return {
    id: "node_" + nextNodeId++,
    name,
    fixed: false,
    branch,
    thinkingType,
    childLayerType,
    children
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