/* Folder tree JSON import. */

window.FolderTreeImport = (() => {
  const { state, thinkingTypes, resetNodeCounter } = window.AppState;

  function isValidThinkingType(value) {
    return Boolean(value && thinkingTypes[value]);
  }

  function getImportedNodeId(name, depth) {
    if (depth === 0 && name === "01_PROFILE") return "profile";
    if (depth === 0 && name === "02_PERSONAL") return "personal";
    if (depth === 0 && name === "03_PROFESSIONAL") return "professional";
    return window.AppState.getNextNodeId();
  }

  function importNode(node, depth = 0) {
    if (!node || typeof node.name !== "string") {
      throw new Error("Invalid folder node.");
    }

    const branch = typeof node.branch === "string" ? node.branch : null;

    return {
      id: getImportedNodeId(node.name, depth),
      name: node.name,
      fixed: Boolean(node.fixed),
      branch,
      thinkingType: isValidThinkingType(node.thinkingType) ? node.thinkingType : null,
      childLayerType: isValidThinkingType(node.childLayerType) ? node.childLayerType : null,
      children: Array.isArray(node.children) ? node.children.map(child => importNode(child, depth + 1)) : []
    };
  }

  function importFolderTreeData(data) {
    if (!data || data.type !== "personal-memory-based-folder-tree" || data.schemaVersion !== 1) {
      throw new Error("Unsupported folder tree template.");
    }

    if (!data.folderTree || data.folderTree.name !== "DOCUMENTS" || !Array.isArray(data.folderTree.children)) {
      throw new Error("Invalid folder tree template.");
    }

    resetNodeCounter();
    state.tree = {
      id: "documents",
      name: "DOCUMENTS",
      fixed: true,
      branch: null,
      thinkingType: null,
      childLayerType: null,
      children: data.folderTree.children.map(child => importNode(child, 0))
    };

    window.FolderTreeRender.renderAll();
  }

  async function importFolderTreeFromFile(file) {
    const text = await file.text();
    const data = JSON.parse(text);
    importFolderTreeData(data);
  }

  async function handleImportInput(input) {
    const file = input.files && input.files[0];
    if (!file) return;

    try {
      await importFolderTreeFromFile(file);
      alert(window.AppMessages.folderTreeImported);
    } catch (error) {
      alert(window.AppMessages.invalidFolderTree);
    } finally {
      input.value = "";
    }
  }

  return {
    importFolderTreeData,
    importFolderTreeFromFile,
    handleImportInput
  };
})();
