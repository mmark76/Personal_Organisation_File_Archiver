/* Folder tree JSON import. */

window.FolderTreeImport = (() => {
  const { state, thinkingTypes, resetNodeCounter } = window.AppState;
  const fixedRootName = "DOCUMENTS";
  const roleBasedThinkingType = "004_ROLE_BASED";
  const fixedFirstLevelNodes = [
    { name: "01_PROFILE", id: "profile", branch: "profile" },
    { name: "02_PERSONAL", id: "personal", branch: "personal" },
    { name: "03_PROFESSIONAL", id: "professional", branch: "professional" }
  ];

  function hasOwnProperty(object, propertyName) {
    return Object.prototype.hasOwnProperty.call(object, propertyName);
  }

  function isExplicitThinkingType(value) {
    return typeof value === "string" && Boolean(thinkingTypes[value]);
  }

  function isNullableThinkingType(value) {
    return value === null || isExplicitThinkingType(value);
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

  function validateThinkingTypeFields(node) {
    if (!hasOwnProperty(node, "thinkingType") || !hasOwnProperty(node, "childLayerType")) {
      throw new Error("Missing thinking type fields.");
    }

    if (!isNullableThinkingType(node.thinkingType) || !isNullableThinkingType(node.childLayerType)) {
      throw new Error("Invalid thinking type.");
    }
  }

  function validateRoleBasedRestriction(branch, thinkingType, childLayerType) {
    if (branch === "professional") return;

    if (thinkingType === roleBasedThinkingType || childLayerType === roleBasedThinkingType) {
      throw new Error("Role-based thinking is allowed only under the professional branch.");
    }
  }

  function validateUniqueSiblingNames(children) {
    const names = new Set();

    children.forEach(child => {
      const key = String(child.name || "").toUpperCase();
      if (names.has(key)) {
        throw new Error("Duplicate sibling folder name.");
      }
      names.add(key);
    });
  }

  function validateChildrenLayer(node, branch) {
    validateUniqueSiblingNames(node.children);

    if (node.children.length === 0) {
      if (node.childLayerType !== null) {
        throw new Error("Leaf folders must not define a child layer type.");
      }
      return;
    }

    if (!isExplicitThinkingType(node.childLayerType)) {
      throw new Error("Folders with children must define a child layer type.");
    }

    validateRoleBasedRestriction(branch, null, node.childLayerType);

    node.children.forEach(child => validateNode(child, branch, node.childLayerType));
  }

  function validateNode(node, expectedBranch, expectedThinkingType = null) {
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

    validateThinkingTypeFields(node);

    if (!Array.isArray(node.children)) {
      throw new Error("Invalid folder children.");
    }

    if (expectedThinkingType === null) {
      const expected = fixedFirstLevelNodes.find(item => item.name === node.name);
      if (!expected || node.fixed !== true || node.branch !== expected.branch || node.thinkingType !== null) {
        throw new Error("Invalid fixed first-level folder.");
      }

      validateChildrenLayer(node, expected.branch);
      return;
    }

    if (node.fixed !== false || node.branch !== expectedBranch || node.thinkingType !== expectedThinkingType) {
      throw new Error("Invalid user-created folder logic.");
    }

    validateRoleBasedRestriction(expectedBranch, node.thinkingType, node.childLayerType);
    validateChildrenLayer(node, expectedBranch);
  }

  function validateRoot(folderTree) {
    if (!folderTree || typeof folderTree !== "object") {
      throw new Error("Invalid folder tree template.");
    }

    if (
      folderTree.name !== fixedRootName ||
      folderTree.fixed !== true ||
      folderTree.branch !== null ||
      folderTree.thinkingType !== null ||
      folderTree.childLayerType !== null ||
      !Array.isArray(folderTree.children)
    ) {
      throw new Error("Invalid folder tree root.");
    }
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
      thinkingType: node.thinkingType,
      childLayerType: node.childLayerType,
      children: node.children.map(child => importNode(child, depth + 1))
    };
  }

  function importFolderTreeData(data) {
    if (!data || data.type !== "personal-memory-based-folder-tree" || data.schemaVersion !== 1) {
      throw new Error("Unsupported folder tree template.");
    }

    validateRoot(data.folderTree);
    validateFixedFirstLevel(data.folderTree.children);
    data.folderTree.children.forEach(child => validateNode(child, child.branch));

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
