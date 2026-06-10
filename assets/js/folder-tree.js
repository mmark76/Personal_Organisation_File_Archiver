/* Folder tree data logic and folder modal behavior. */

window.FolderTree = (() => {
  const { state, thinkingTypes, getNextNodeId, resetNodeCounter } = window.AppState;
  const { sanitizeFolderName } = window.AppUtils;

  function findNodeById(nodeId, current = state.tree) {
    if (!current) return null;
    if (current.id === nodeId) return current;

    for (const child of current.children || []) {
      const found = findNodeById(nodeId, child);
      if (found) return found;
    }

    return null;
  }

  function findParentNode(nodeId, current = state.tree, parent = null) {
    if (!current) return null;
    if (current.id === nodeId) return parent;

    for (const child of current.children || []) {
      const found = findParentNode(nodeId, child, current);
      if (found) return found;
    }

    return null;
  }

  function containsNode(current, nodeId) {
    if (!current || !nodeId) return false;
    if (current.id === nodeId) return true;
    return (current.children || []).some(child => containsNode(child, nodeId));
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

    walk(state.tree);
    return path;
  }

  function getVisibleName(name, node = null) {
    if (node && node.fixed && node.branch) {
      return String(name || "").replace(/^\d{2}_/, "");
    }

    return String(name || "");
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
        (node.children || []).forEach(walk);
        return;
      }

      paths.push(getFolderPath(node.id));
      (node.children || []).forEach(walk);
    }

    walk(state.tree);
    return paths;
  }

  function getAllowedThinkingTypes(parent) {
    if (!parent) return Object.keys(thinkingTypes);
    if (parent.childLayerType) return [parent.childLayerType];
    if (parent.branch === "professional") return Object.keys(thinkingTypes);
    return Object.keys(thinkingTypes).filter(type => type !== "004_ROLE_BASED");
  }

  function hasSiblingFolderName(parent, name) {
    return (parent.children || []).some(child => child.name === name);
  }

  function updateThinkingPrompt() {
    const select = document.getElementById("thinkingTypeSelect");
    const examplesBox = document.getElementById("examplesBox");
    if (!select || !examplesBox) return;

    const selectedType = thinkingTypes[select.value];
    examplesBox.textContent = selectedType ? selectedType.prompt : "";
  }

  function openAddFolderModal(parentId) {
    const parent = findNodeById(parentId);
    if (!parent) return;

    state.selectedParentId = parentId;

    const context = document.getElementById("folderModalContext");
    const select = document.getElementById("thinkingTypeSelect");
    const fixedType = document.getElementById("fixedThinkingType");
    const input = document.getElementById("folderNameInput");

    if (context) context.textContent = `Add a folder under ${getVisibleName(parent.name, parent)}.`;
    if (input) input.value = "";

    const allowedTypes = getAllowedThinkingTypes(parent);

    if (select) {
      select.innerHTML = "";
      allowedTypes.forEach(type => {
        const option = document.createElement("option");
        option.value = type;
        option.textContent = thinkingTypes[type].label;
        select.appendChild(option);
      });
      select.disabled = Boolean(parent.childLayerType);
    }

    if (fixedType) {
      if (parent.childLayerType) {
        fixedType.hidden = false;
        fixedType.textContent = `This layer already uses: ${thinkingTypes[parent.childLayerType].label}`;
      } else {
        fixedType.hidden = true;
        fixedType.textContent = "";
      }
    }

    updateThinkingPrompt();
    window.AppModals.openModal("folderModal");
  }

  function confirmAddFolder() {
    const parent = findNodeById(state.selectedParentId);
    const select = document.getElementById("thinkingTypeSelect");
    const input = document.getElementById("folderNameInput");

    if (!parent || !select || !input) return;

    const name = sanitizeFolderName(input.value);
    if (!name) {
      alert(window.AppMessages.invalidFolderName);
      return;
    }

    if (hasSiblingFolderName(parent, name)) {
      alert(window.AppMessages.duplicateFolderName);
      return;
    }

    const thinkingType = parent.childLayerType || select.value;
    if (!parent.childLayerType) parent.childLayerType = thinkingType;

    parent.children.push({
      id: getNextNodeId(),
      name,
      fixed: false,
      branch: parent.branch || null,
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

  function selectArchiveFolder(nodeId) {
    const node = findNodeById(nodeId);
    if (!node || node.id === "documents") return;

    state.selectedArchiveFolderId = nodeId;
    window.AppUtils.setText(
      "#archiveResultBox",
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

  function loadExampleTree() {
    resetNodeCounter();
    state.selectedArchiveFolderId = null;

    const chronological = "001_CHRONOLOGICAL";
    const thematic = "002_THEMATIC";
    const functional = "003_FUNCTIONAL";

    state.tree = window.AppState.createFixedTree();
    const profile = findNodeById("profile");
    const personal = findNodeById("personal");
    const professional = findNodeById("professional");

    profile.childLayerType = functional;
    profile.children = [
      createNode("CVS", "profile", functional),
      createNode("DEGREES", "profile", functional),
      createNode("CERTIFICATES", "profile", functional),
      createNode("REFERENCES", "profile", functional),
      createNode("SUPPORTING_EVIDENCE", "profile", functional)
    ];

    const interests = createNode("INTERESTS", "personal", thematic, thematic, [
      createNode("CHESS", "personal", thematic),
      createNode("SWIMMING", "personal", thematic),
      createNode("MNEMONIC_TECHNIQUES", "personal", thematic),
      createNode("BLOG_WRITING", "personal", thematic),
      createNode("WEB_APPS", "personal", thematic),
      createNode("LEARNING", "personal", thematic)
    ]);

    personal.childLayerType = thematic;
    personal.children = [
      createNode("FAMILY", "personal", thematic),
      createNode("HEALTH", "personal", thematic),
      createNode("FINANCIAL", "personal", thematic),
      interests
    ];

    professional.childLayerType = chronological;
    professional.children = [
      createNode("2002-2010_PRIVATE_SECTOR", "professional", chronological),
      createNode("2010-2019_MARINAS_PPP_DBFOT", "professional", chronological),
      createNode("2019-2026_STATE_FAIR_SITE_MANAGEMENT", "professional", chronological),
      createNode("2026-NOW_HEALTH_AND_SAFETY_OFFICER", "professional", chronological)
    ];

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
    openAddFolderModal,
    confirmAddFolder,
    deleteFolder,
    selectArchiveFolder,
    updateThinkingPrompt,
    loadExampleTree
  };
})();