/* Folder tree data model and operations. */

window.FolderTree = (() => {
  const { state, thinkingTypes, getNextNodeId } = window.AppState;

  function findNodeById(nodeId, node = state.tree) {
    if (!node) return null;
    if (node.id === nodeId) return node;

    for (const child of node.children || []) {
      const result = findNodeById(nodeId, child);
      if (result) return result;
    }

    return null;
  }

  function findParentNode(nodeId, node = state.tree, parent = null) {
    if (!node) return null;
    if (node.id === nodeId) return parent;

    for (const child of node.children || []) {
      const result = findParentNode(nodeId, child, node);
      if (result) return result;
    }

    return null;
  }

  function containsNode(rootNode, nodeId) {
    if (!rootNode || !nodeId) return false;
    if (rootNode.id === nodeId) return true;
    return (rootNode.children || []).some(child => containsNode(child, nodeId));
  }

  function getNodePath(nodeId) {
    const path = [];

    function walk(node) {
      if (!node) return false;
      path.push(node);
      if (node.id === nodeId) return true;

      for (const child of node.children || []) {
        if (walk(child)) return true;
      }

      path.pop();
      return false;
    }

    return walk(state.tree) ? path : [];
  }

  function getVisibleName(name, node) {
    if (!node || !node.fixed) return name;
    return name;
  }

  function getFolderPath(nodeId) {
    return getNodePath(nodeId)
      .filter(node => node.id !== "documents")
      .map(node => node.name)
      .join("/");
  }

  function getAllFolderPaths() {
    const paths = [];

    function walk(node) {
      if (!node || node.id === "documents") {
        (node?.children || []).forEach(walk);
        return;
      }

      paths.push(getFolderPath(node.id));
      (node.children || []).forEach(walk);
    }

    walk(state.tree);
    return paths;
  }

  function getAllowedThinkingTypes(parentNode) {
    const entries = Object.entries(thinkingTypes);
    if (!parentNode) return entries;

    const rootBranch = getNodePath(parentNode.id).find(node => node.branch)?.branch;
    if (rootBranch === "professional") return entries;

    return entries.filter(([key]) => key !== "004_ROLE_BASED");
  }

  function hasDuplicateSiblingName(parentNode, folderName) {
    return (parentNode.children || []).some(child => child.name === folderName);
  }

  function updateThinkingPrompt() {
    const select = document.getElementById("thinkingTypeSelect");
    const prompt = document.getElementById("thinkingTypePrompt");
    if (!select || !prompt) return;

    const selected = thinkingTypes[select.value];
    prompt.textContent = selected ? selected.prompt : "";
  }

  function setFixedTypeText(element, text) {
    if (!element) return;
    element.textContent = text;
    element.hidden = !text;
  }

  function openAddFolderModal(parentId) {
    const parentNode = findNodeById(parentId);
    if (!parentNode) return;

    state.selectedParentId = parentId;

    const modalContext = document.getElementById("folderModalContext");
    const nameInput = document.getElementById("folderNameInput");
    const select = document.getElementById("thinkingTypeSelect");
    const fixedType = document.getElementById("fixedThinkingType");

    if (modalContext) modalContext.textContent = `Add a folder under: ${getFolderPath(parentId) || parentNode.name}`;
    if (nameInput) nameInput.value = "";

    if (select) {
      select.innerHTML = "";
      getAllowedThinkingTypes(parentNode).forEach(([key, value]) => {
        const option = document.createElement("option");
        option.value = key;
        option.textContent = value.label;
        select.appendChild(option);
      });

      if (parentNode.childLayerType) {
        select.value = parentNode.childLayerType;
        select.disabled = true;
        setFixedTypeText(fixedType, `This layer already uses: ${thinkingTypes[parentNode.childLayerType].label}`);
      } else {
        select.disabled = false;
        setFixedTypeText(fixedType, "");
      }
    }

    updateThinkingPrompt();
    window.AppModals.openModal("folderModal");
    if (nameInput) nameInput.focus();
  }

  function confirmAddFolder() {
    const parentNode = findNodeById(state.selectedParentId);
    const input = document.getElementById("folderNameInput");
    const select = document.getElementById("thinkingTypeSelect");

    if (!parentNode || !input || !select) return;

    const folderName = window.AppUtils.sanitizeFolderName(input.value);
    const thinkingType = parentNode.childLayerType || select.value;

    if (!folderName) {
      alert(window.AppMessages.invalidFolderName);
      return;
    }

    if (hasDuplicateSiblingName(parentNode, folderName)) {
      alert(window.AppMessages.duplicateFolderName);
      return;
    }

    if (!parentNode.childLayerType) {
      parentNode.childLayerType = thinkingType;
    }

    parentNode.children.push({
      id: getNextNodeId(),
      name: folderName,
      fixed: false,
      branch: parentNode.branch,
      thinkingType,
      childLayerType: null,
      children: []
    });

    state.selectedParentId = null;
    window.AppModals.closeModal("folderModal");
    window.FolderTreeRender.renderAll();
  }

  function deleteFolder(nodeId) {
    const node = findNodeById(nodeId);
    if (!node || node.fixed) return;

    const parent = findParentNode(nodeId);
    if (!parent) return;

    if (containsNode(node, state.selectedArchiveFolderId)) {
      state.selectedArchiveFolderId = null;
    }

    parent.children = parent.children.filter(child => child.id !== nodeId);
    if (parent.children.length === 0) parent.childLayerType = null;

    window.FolderTreeRender.renderAll();
  }

  function getArchiveResultSelector() {
    return window.AppState.getActiveMode() === "archiveFolder"
      ? "#folderArchiveResultBox"
      : "#archiveResultBox";
  }

  function selectArchiveFolder(nodeId) {
    const node = findNodeById(nodeId);
    if (!node || node.id === "documents") return;

    state.selectedArchiveFolderId = nodeId;
    window.AppUtils.setText(
      getArchiveResultSelector(),
      `${window.AppMessages.archiveDestinationSelected} ${getFolderPath(nodeId)}`
    );
    window.FolderTreeRender.renderArchivePreview();
  }

  function createNode(name, branch, thinkingType = null, childLayerType = null, children = []) {
    return {
      id: getNextNodeId(),
      name,
      fixed: false,
      branch,
      thinkingType,
      childLayerType,
      children
    };
  }

  function createPeriodNode(name) {
    return createNode(name, "professional", "001_CHRONOLOGICAL", "003_FUNCTIONAL", [
      createNode("MAIN_ACTIVITY", "professional", "003_FUNCTIONAL"),
      createNode("PROJECTS", "professional", "003_FUNCTIONAL"),
      createNode("DOCUMENTS", "professional", "003_FUNCTIONAL"),
      createNode("NOTES_AND_REPORTS", "professional", "003_FUNCTIONAL"),
      createNode("CORRESPONDENCE", "professional", "003_FUNCTIONAL"),
      createNode("ARCHIVE", "professional", "003_FUNCTIONAL")
    ]);
  }

  function loadExampleTree() {
    window.AppState.resetNodeCounter();

    const profile = {
      id: "profile",
      name: "PROFILE",
      fixed: true,
      branch: "profile",
      thinkingType: null,
      childLayerType: "003_FUNCTIONAL",
      children: [
        createNode("INBOX", "profile", "003_FUNCTIONAL"),
        createNode("IDENTITY", "profile", "003_FUNCTIONAL", "003_FUNCTIONAL", [
          createNode("ID_CARD", "profile", "003_FUNCTIONAL"),
          createNode("PASSPORT", "profile", "003_FUNCTIONAL"),
          createNode("DRIVING_LICENSE", "profile", "003_FUNCTIONAL"),
          createNode("PERSONAL_DETAILS", "profile", "003_FUNCTIONAL")
        ]),
        createNode("OFFICIAL_RECORDS", "profile", "003_FUNCTIONAL"),
        createNode("PROFESSIONAL_LICENSES", "profile", "003_FUNCTIONAL"),
        createNode("CV", "profile", "003_FUNCTIONAL"),
        createNode("DEGREES", "profile", "003_FUNCTIONAL"),
        createNode("CERTIFICATES", "profile", "003_FUNCTIONAL"),
        createNode("REFERENCES", "profile", "003_FUNCTIONAL"),
        createNode("PUBLIC_PROFILE_AND_PORTFOLIO", "profile", "003_FUNCTIONAL")
      ]
    };

    const personal = {
      id: "personal",
      name: "PERSONAL",
      fixed: true,
      branch: "personal",
      thinkingType: null,
      childLayerType: "002_THEMATIC",
      children: [
        createNode("INBOX", "personal", "002_THEMATIC"),
        createNode("FAMILY_AND_FRIENDS", "personal", "002_THEMATIC"),
        createNode("HEALTH", "personal", "002_THEMATIC"),
        createNode("FINANCE", "personal", "002_THEMATIC"),
        createNode("HOBBIES_AND_INTERESTS", "personal", "002_THEMATIC"),
        createNode("HOME_AND_ASSETS", "personal", "002_THEMATIC"),
        createNode("PHOTOS_AND_VIDEOS", "personal", "002_THEMATIC"),
        createNode("DIGITAL_LIFE", "personal", "002_THEMATIC", "003_FUNCTIONAL", [
          createNode("ACCOUNTS_AND_ACCESS", "personal", "003_FUNCTIONAL"),
          createNode("DEVICES_AND_SOFTWARE", "personal", "003_FUNCTIONAL"),
          createNode("BACKUPS_AND_EXPORTS", "personal", "003_FUNCTIONAL")
        ])
      ]
    };

    const professional = {
      id: "professional",
      name: "PROFESSIONAL",
      fixed: true,
      branch: "professional",
      thinkingType: null,
      childLayerType: "001_CHRONOLOGICAL",
      children: [
        createNode("INBOX", "professional", "001_CHRONOLOGICAL"),
        createPeriodNode("PERIOD_1"),
        createPeriodNode("PERIOD_2"),
        createPeriodNode("PERIOD_3"),
        createNode("GENERAL_ARCHIVE", "professional", "001_CHRONOLOGICAL")
      ]
    };

    window.AppState.setTree({
      id: "documents",
      name: "Organize Your PC",
      fixed: true,
      branch: null,
      thinkingType: null,
      childLayerType: null,
      children: [profile, personal, professional]
    });

    window.FolderTreeRender.renderAll();
  }

  return {
    findNodeById,
    findParentNode,
    containsNode,
    getNodePath,
    getVisibleName,
    getFolderPath,
    getAllFolderPaths,
    getAllowedThinkingTypes,
    hasDuplicateSiblingName,
    updateThinkingPrompt,
    openAddFolderModal,
    confirmAddFolder,
    deleteFolder,
    selectArchiveFolder,
    createNode,
    loadExampleTree
  };
})();