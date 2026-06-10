/* Folder tree JSON import. */

window.FolderTreeImport = (() => {
  const { state, thinkingTypes, resetNodeCounter } = window.AppState;
  const fixedRootName = "DOCUMENTS";
  const fixedFirstLevelNodes = [
    { name: "01_PROFILE", id: "profile", branch: "profile" },
    { name: "02_PERSONAL", id: "personal", branch: "personal" },
    { name: "03_PROFESSIONAL", id: "professional", branch: "professional" }
  ];

  function isValidThinkingType(value) {
    return value === null || value === undefined || Boolean(thinkingTypes[value]);
  }

  function isSafeFolderName(value) {
    if (typeof value !== "string") return false;
    const trimmed = value.trim();
    if (!trimmed) return false;
    if (trimmed !== value) return false;
    if (/[<>:"/\\|?*]/.test(trimmed)) return false;
    if (/[\x00-\x1F]/.test(trimmed)) return false;
    if (trimmed === "." || trimmed === "..") return false;
    return true;
  }

  function validateNode(node, depth = 0) {
    if (!node || typeof node !== "object") {
      throw new Error("Invalid folder node.");
    }

    if (!isSafeFolderName(node.name)) {
      throw new Error("Invalid folder name.");
    }

    if (typeof node.fixed !== "boolean") {
      throw new Error("Invalid fixed folder flag.");
    }

    if (!(node.branch === null || typeof node.branch === "string")) {
      throw new Error("Invalid folder branch.");
    }

    if (!isValidThinkingType(node.thinkingType) || !isValidThinkingType(node.childLayerType)) {
      throw new Error("Invalid thinking type.");
    }

    if (!Array.isArray(node.children)) {
      throw new Error("Invalid folder children.");
    }

    if (depth === 0) {
      const expected = fixedFirstLevelNodes.find(item => item.name === node.name);
      if (!expected || node.fixed !== true || node.branch !== expected.branch) {
        throw new Error("Invalid fixed first-level folder.");
      }
    }

    node.children.forEach(child => validateNode(child, depth + 1));
  }

  function validateFixedFirstLevel(children) {
    if (!Array.isArray(children) || children.length !== fixedFirstLevelNodes.length) {
      throw new Error("Invalid first-level folder structure.");
    }

    fixedFirstLevelNodes.forEach((expected, index) => {
      const node = children[index];
      if (!node || node.name !== expected.name || node.fixed !== true || node.branch !== expected.branch) {
        throw new Error("Invalid fixed first-level folder structure.");
      }
    });
  }

  function getImportedNodeId(name, depth) {
    const fixedNode = depth === 0 ? fixedFirstLevelNodes.find(item => item.name === name) : null;
    return fixedNode ? fixedNode.id : window.AppState.getNextNodeId();
  }

  function importNode(node, depth = 0) {
    return {
      id: getImportedNodeId(node.name, depth),
      name: node.name,
      fixed: Boolean(node.fixed),
      branch: node.branch,
      thinkingType: node.thinkingType || null,
      childLayerType: node.childLayerType || null,
      children: node.children.map(child => importNode(child, depth + 1))
    };
  }

  function importFolderTreeData(data) {
    if (!data || data.type !== "personal-memory-based-folder-tree" || data.schemaVersion !== 1) {
      throw new Error("Unsupported folder tree template.");
    }

    if (!data.folderTree || data.folderTree.name !== fixedRootName || !Array.isArray(data.folderTree.children)) {
      throw new Error("Invalid folder tree template.");
    }

    validateFixedFirstLevel(data.folderTree.children);
    data.folderTree.children.forEach(child => validateNode(child, 0));

    resetNodeCounter();
    state.tree = {
      id: "documents",
      name: fixedRootName,
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