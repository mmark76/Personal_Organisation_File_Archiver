let selectedParentId = null;
let latestFolderPaths = [];
let nextNodeId = 1;
let currentLanguage = "en";

const uiText = {
  en: {
    appTitle: "Personal Memory-Based File Advisor",
    appSubtitle: "Build a personal folder tree and use it to decide where each new file belongs. The app does not move, delete, upload, or modify files.",
    languageLabel: "Language",
    folderTreeTitle: "Folder Tree",
    folderTreeSubtitle: "Fixed first level. Add unlimited layers below it.",
    loadExampleButton: "Load Markellos Example",
    guidanceTitle: "Before adding folders, choose one thinking type for the next layer.",
    guidanceText: "Chronological, thematic, functional, or role-based. The type guides the names; it does not become a folder.",
    fileDestinationTitle: "File Destination Guide",
    fileDestinationSubtitle: "Use the tree you built to decide where a new file should be archived.",
    fileNameLabel: "File name",
    fileNamePlaceholder: "Example: CV_Markellos_2026.pdf",
    destinationFolderLabel: "Suggested destination folder",
    reasonLabel: "Reason / memory clue",
    reasonPlaceholder: "Example: This is the final CV version for future applications.",
    previewAdviceButton: "Preview Advice",
    copyAdviceButton: "Copy Advice",
    adviceDefault: "Archiving advice will appear here.",
    currentStructureTitle: "Current Structure",
    copyStructureButton: "Copy Structure",
    downloadTxtButton: "Download TXT",
    downloadBatButton: "Download Windows .BAT",
    createFoldersButton: "Create Folders on This PC",
    folderCreationNote: "Folder creation is optional and works only in supported browsers after you choose a local destination folder.",
    addFolderTitle: "Add Folder",
    thinkingTypeLabel: "Thinking type for this layer",
    addButton: "Add",
    cancelButton: "Cancel",
    parentFolder: "Parent folder",
    fixedLayer: "This layer already uses",
    examplesTitle: "Examples from your tree:",
    typePrefix: "Type",
    nextLayerPrefix: "The next layer here is",
    enterFolderName: "Please enter a folder name.",
    outputTitle: "Suggested folder structure",
    principle: "Principle:",
    fixedFirstLevel: "- Fixed first level: 01_PROFILE, 02_PERSONAL, 03_PROFESSIONAL",
    unlimitedLayers: "- Unlimited layers below the fixed branches",
    oneThinkingType: "- Each layer has one thinking type",
    typeGuidesNames: "- The thinking type guides the folder names; it is not a folder",
    fileAdviceTitle: "File destination advice",
    file: "File:",
    suggestedFolder: "Suggested folder:",
    reasonMemory: "Reason / memory clue:",
    important: "Important:",
    guidanceOnly: "This is guidance only. The app does not move the file.",
    newFile: "[New file]",
    chooseFolder: "[Choose a folder from the tree]",
    noReason: "No reason written yet.",
    unsupportedFileApi: "This browser does not support direct folder creation. Use Chrome or Edge, or download the Windows .BAT file.",
    folderCreationComplete: "Folder structure created successfully.",
    folderCreationCancelled: "Folder creation was cancelled or failed."
  },
  el: {
    appTitle: "Προσωπικός Σύμβουλος Αρχειοθέτησης με βάση τη Μνήμη",
    appSubtitle: "Χτίσε προσωπικό δέντρο φακέλων και χρησιμοποίησέ το για να αποφασίζεις πού ανήκει κάθε νέο αρχείο. Το app δεν μετακινεί, δεν διαγράφει, δεν ανεβάζει και δεν τροποποιεί αρχεία.",
    languageLabel: "Γλώσσα",
    folderTreeTitle: "Δέντρο Φακέλων",
    folderTreeSubtitle: "Σταθερό πρώτο επίπεδο. Πρόσθεσε απεριόριστα επίπεδα από κάτω.",
    loadExampleButton: "Φόρτωσε Παράδειγμα Μάρκελλου",
    guidanceTitle: "Πριν προσθέσεις φακέλους, διάλεξε έναν τύπο σκέψης για το επόμενο επίπεδο.",
    guidanceText: "Χρονική, θεματική, λειτουργική ή ρόλου. Ο τύπος καθοδηγεί τα ονόματα· δεν γίνεται φάκελος.",
    fileDestinationTitle: "Οδηγός Προορισμού Αρχείου",
    fileDestinationSubtitle: "Χρησιμοποίησε το δέντρο που έχτισες για να αποφασίσεις πού θα αρχειοθετηθεί ένα νέο αρχείο.",
    fileNameLabel: "Όνομα αρχείου",
    fileNamePlaceholder: "Παράδειγμα: CV_Markellos_2026.pdf",
    destinationFolderLabel: "Προτεινόμενος φάκελος προορισμού",
    reasonLabel: "Λόγος / μνημονικό στοιχείο",
    reasonPlaceholder: "Παράδειγμα: Είναι η τελική έκδοση CV για μελλοντικές αιτήσεις.",
    previewAdviceButton: "Προεπισκόπηση Οδηγίας",
    copyAdviceButton: "Αντιγραφή Οδηγίας",
    adviceDefault: "Η οδηγία αρχειοθέτησης θα εμφανιστεί εδώ.",
    currentStructureTitle: "Τρέχουσα Δομή",
    copyStructureButton: "Αντιγραφή Δομής",
    downloadTxtButton: "Λήψη TXT",
    downloadBatButton: "Λήψη Windows .BAT",
    createFoldersButton: "Δημιουργία Φακέλων στο PC",
    folderCreationNote: "Η δημιουργία φακέλων είναι προαιρετική και λειτουργεί μόνο σε υποστηριζόμενους browsers αφού επιλέξεις τοπικό φάκελο.",
    addFolderTitle: "Προσθήκη Φακέλου",
    thinkingTypeLabel: "Τύπος σκέψης για αυτό το επίπεδο",
    addButton: "Προσθήκη",
    cancelButton: "Ακύρωση",
    parentFolder: "Γονικός φάκελος",
    fixedLayer: "Αυτό το επίπεδο ήδη χρησιμοποιεί",
    examplesTitle: "Παραδείγματα από το δέντρο σου:",
    typePrefix: "Τύπος",
    nextLayerPrefix: "Το επόμενο layer εδώ είναι",
    enterFolderName: "Γράψε όνομα φακέλου.",
    outputTitle: "Προτεινόμενη δομή φακέλων",
    principle: "Αρχή:",
    fixedFirstLevel: "- Σταθερό πρώτο επίπεδο: 01_PROFILE, 02_PERSONAL, 03_PROFESSIONAL",
    unlimitedLayers: "- Απεριόριστα επίπεδα κάτω από τους σταθερούς κλάδους",
    oneThinkingType: "- Κάθε επίπεδο έχει έναν τύπο σκέψης",
    typeGuidesNames: "- Ο τύπος σκέψης καθοδηγεί τα ονόματα φακέλων· δεν είναι φάκελος",
    fileAdviceTitle: "Οδηγία προορισμού αρχείου",
    file: "Αρχείο:",
    suggestedFolder: "Προτεινόμενος φάκελος:",
    reasonMemory: "Λόγος / μνημονικό στοιχείο:",
    important: "Σημαντικό:",
    guidanceOnly: "Αυτό είναι μόνο καθοδήγηση. Το app δεν μετακινεί το αρχείο.",
    newFile: "[Νέο αρχείο]",
    chooseFolder: "[Διάλεξε φάκελο από το δέντρο]",
    noReason: "Δεν έχει γραφτεί λόγος ακόμη.",
    unsupportedFileApi: "Ο browser δεν υποστηρίζει άμεση δημιουργία φακέλων. Χρησιμοποίησε Chrome ή Edge, ή κατέβασε το Windows .BAT.",
    folderCreationComplete: "Η δομή φακέλων δημιουργήθηκε με επιτυχία.",
    folderCreationCancelled: "Η δημιουργία φακέλων ακυρώθηκε ή απέτυχε."
  }
};

const thinkingTypes = {
  "001_CHRONOLOGICAL": {
    enLabel: "001 - CHRONOLOGICAL",
    elLabel: "001 - ΧΡΟΝΙΚΗ",
    enPrompt: "Give a chronological period name",
    elPrompt: "Δώσε όνομα χρονικής περιόδου",
    examples: ["2024", "2025", "2002-2010_PRIVATE_SECTOR", "2019-NOW_MECI"]
  },
  "002_THEMATIC": {
    enLabel: "002 - THEMATIC",
    elLabel: "002 - ΘΕΜΑΤΙΚΗ",
    enPrompt: "Give a theme name",
    elPrompt: "Δώσε όνομα θέματος",
    examples: ["HEALTH", "FINANCIAL", "INTERESTS", "FAMILY"]
  },
  "003_FUNCTIONAL": {
    enLabel: "003 - FUNCTIONAL",
    elLabel: "003 - ΛΕΙΤΟΥΡΓΙΚΗ",
    enPrompt: "Give a function name",
    elPrompt: "Δώσε όνομα λειτουργίας",
    examples: ["CV", "APPLICATIONS", "CERTIFICATES", "REFERENCE", "FINAL", "OLD"]
  },
  "004_ROLE_BASED": {
    enLabel: "004 - ROLE-BASED",
    elLabel: "004 - ΡΟΛΟΥ",
    enPrompt: "Give a role name",
    elPrompt: "Δώσε όνομα ρόλου",
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

function tr(key) {
  return uiText[currentLanguage][key] || uiText.en[key] || key;
}

function typeLabel(typeKey) {
  return currentLanguage === "el" ? thinkingTypes[typeKey].elLabel : thinkingTypes[typeKey].enLabel;
}

function typePrompt(typeKey) {
  return currentLanguage === "el" ? thinkingTypes[typeKey].elPrompt : thinkingTypes[typeKey].enPrompt;
}

function changeLanguage() {
  currentLanguage = document.getElementById("languageSelect").value;
  document.documentElement.lang = currentLanguage;

  document.querySelectorAll("[data-i18n]").forEach(element => {
    const key = element.getAttribute("data-i18n");
    element.textContent = tr(key);
  });

  document.querySelectorAll("[data-placeholder-key]").forEach(element => {
    const key = element.getAttribute("data-placeholder-key");
    element.placeholder = tr(key);
  });

  updateThinkingTypeOptions();
  renderTree();

  if (document.getElementById("fileDestinationOutput").textContent.trim() === uiText.en.adviceDefault || document.getElementById("fileDestinationOutput").textContent.trim() === uiText.el.adviceDefault) {
    document.getElementById("fileDestinationOutput").textContent = tr("adviceDefault");
  }
}

function updateThinkingTypeOptions() {
  const select = document.getElementById("thinkingTypeSelect");
  if (!select) return;
  Array.from(select.options).forEach(option => {
    option.textContent = typeLabel(option.value);
  });
  updateThinkingPrompt();
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
  treeContainer.appendChild(renderNode(tree, 0));
  updateOutput();
  updateDestinationOptions();
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
    type.textContent = tr("typePrefix") + ": " + typeLabel(node.thinkingType);
    content.appendChild(type);
  }

  const name = document.createElement("div");
  name.className = "node-name";
  name.textContent = node.name;
  content.appendChild(name);

  if (node.childLayerType) {
    const nextType = document.createElement("div");
    nextType.className = "node-next-layer";
    nextType.textContent = tr("nextLayerPrefix") + ": " + typeLabel(node.childLayerType);
    content.appendChild(nextType);
  }

  const actions = document.createElement("div");
  actions.className = "node-actions";

  if (node.id !== "root") {
    const addButton = document.createElement("button");
    addButton.type = "button";
    addButton.textContent = "+";
    addButton.onclick = () => openNodeModal(node.id);
    actions.appendChild(addButton);
  }

  if (!node.fixed) {
    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.className = "danger small-button";
    deleteButton.textContent = "×";
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

  context.textContent = tr("parentFolder") + ": " + parentNode.name;
  folderNameInput.value = "";

  const allowedTypes = getAllowedThinkingTypes(parentNode);
  Array.from(select.options).forEach(option => {
    option.disabled = !allowedTypes.includes(option.value);
  });

  if (parentNode.childLayerType) {
    select.value = parentNode.childLayerType;
    select.disabled = true;
    fixedType.classList.remove("hidden");
    fixedType.textContent = tr("fixedLayer") + ": " + typeLabel(parentNode.childLayerType);
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

  label.textContent = typePrompt(thinkingType);
  examplesBox.innerHTML = "";

  const title = document.createElement("strong");
  title.textContent = tr("examplesTitle");
  examplesBox.appendChild(title);

  const list = document.createElement("div");
  list.className = "example-tags";

  thinkingTypes[thinkingType].examples.forEach(example => {
    const tag = document.createElement("span");
    tag.className = "example-tag";
    tag.textContent = example;
    tag.onclick = () => { document.getElementById("folderNameInput").value = example; };
    list.appendChild(tag);
  });

  examplesBox.appendChild(list);
}

function confirmAddChild() {
  const parentNode = findNode(selectedParentId);
  const cleanName = sanitizeFolderName(document.getElementById("folderNameInput").value);
  const thinkingType = document.getElementById("thinkingTypeSelect").value;

  if (!cleanName) {
    alert(tr("enterFolderName"));
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
    destinations.push({ id: node.id, path: nodePath.replace(/^DOCUMENTS\\?/, ""), thinkingType: node.thinkingType || "" });
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
    const typeText = destination.thinkingType ? " [" + typeLabel(destination.thinkingType) + "]" : "";
    option.textContent = destination.path + typeText;
    select.appendChild(option);
  });
  if (previousValue && Array.from(select.options).some(option => option.value === previousValue)) select.value = previousValue;
}

function updateOutput() {
  const output = [
    tr("outputTitle"), "", tr("principle"), tr("fixedFirstLevel"), tr("unlimitedLayers"), tr("oneThinkingType"), tr("typeGuidesNames"), "",
    ...buildOutputLines(tree)
  ];
  latestFolderPaths = buildFolderPaths(tree);
  document.getElementById("treeOutput").textContent = output.join("\n");
}

function previewFileDestination() {
  const fileName = document.getElementById("destinationFileName").value.trim() || tr("newFile");
  const destination = document.getElementById("destinationNodeSelect").value || tr("chooseFolder");
  const reason = document.getElementById("destinationReason").value.trim() || tr("noReason");

  const advice = [
    tr("fileAdviceTitle"), "", tr("file"), fileName, "", tr("suggestedFolder"), destination, "", tr("reasonMemory"), reason, "", tr("important"), tr("guidanceOnly")
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
  return { id: "node_" + nextNodeId++, name, fixed: false, branch, thinkingType, childLayerType: null, children: [] };
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
  latestFolderPaths.forEach(path => { content += 'mkdir "' + path + '" 2>nul\r\n'; });
  content += "\r\necho Done.\r\npause\r\n";
  downloadFile("create_suggested_folder_structure.bat", content, "application/x-bat;charset=utf-8");
}

async function createFoldersOnComputer() {
  if (!window.showDirectoryPicker) {
    alert(tr("unsupportedFileApi"));
    return;
  }
  try {
    const rootHandle = await window.showDirectoryPicker();
    for (const folderPath of latestFolderPaths) {
      const parts = folderPath.split("\\").filter(Boolean);
      let currentHandle = rootHandle;
      for (const part of parts) currentHandle = await currentHandle.getDirectoryHandle(part, { create: true });
    }
    alert(tr("folderCreationComplete"));
  } catch (error) {
    alert(tr("folderCreationCancelled"));
  }
}

function copyTreeOutput() {
  navigator.clipboard.writeText(document.getElementById("treeOutput").textContent);
}

changeLanguage();