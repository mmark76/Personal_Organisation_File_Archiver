/* Build a folder tree from an existing local folder chosen by the user. */

window.FolderTreeExisting = (() => {
  const {
    state,
    getActiveMode,
    getActiveModeRevision,
    getModeState,
    getNextNodeId,
    resetNodeCounter,
    setTree
  } = window.AppState;
  const { setText } = window.AppUtils;
  const activeLoadIds = new Map();
  let nextLoadId = 0;

  function createImportedNode(name, children = [], modeName) {
    return {
      id: getNextNodeId(modeName),
      name: String(name || "UNTITLED_FOLDER"),
      fixed: false,
      branch: null,
      thinkingType: null,
      childLayerType: null,
      children
    };
  }

  function getSelectedDepth(selectId = "existingTreeDepthSelect") {
    const select = document.getElementById(selectId);
    const depth = Number(select?.value || 2);
    return [1, 2, 3].includes(depth) ? depth : 2;
  }

  async function readFolderChildren(directoryHandle, currentDepth, maxDepth, counter) {
    if (currentDepth > maxDepth) return [];

    const folders = [];

    for await (const [name, handle] of directoryHandle.entries()) {
      if (handle.kind !== "directory") continue;

      counter.count += 1;
      const children = currentDepth < maxDepth
        ? await readFolderChildren(handle, currentDepth + 1, maxDepth, counter)
        : [];

      folders.push({
        name: String(name || "UNTITLED_FOLDER"),
        children
      });
    }

    folders.sort((a, b) => a.name.localeCompare(b.name));
    return folders;
  }

  function materializeImportedNode(folder, modeName) {
    const children = folder.children.map(child => materializeImportedNode(child, modeName));
    return createImportedNode(folder.name, children, modeName);
  }

  function buildAppTree(rootFolderName, childFolders, modeName) {
    const childNodes = childFolders.map(folder => materializeImportedNode(folder, modeName));
    const rootNode = createImportedNode(
      rootFolderName || "SELECTED_FOLDER",
      childNodes,
      modeName
    );

    return {
      id: "documents",
      name: "DOCUMENTS",
      fixed: true,
      branch: null,
      thinkingType: null,
      childLayerType: null,
      children: [rootNode]
    };
  }

  function getArchiveDestination(nodeId) {
    const pathNodes = window.FolderTree.getNodePath(nodeId)
      .filter(node => node.id !== "documents");
    const selectedRootNodeId = state.appRootTree === state.tree
      ? state.appRootNodeId
      : null;
    const isSelectedRootTree = selectedRootNodeId && pathNodes[0]?.id === selectedRootNodeId;
    const relativeNodes = isSelectedRootTree ? pathNodes.slice(1) : pathNodes;

    return {
      relativePath: relativeNodes.map(node => node.name).join("/"),
      displayPath: pathNodes.map(node => node.name).join("/")
    };
  }

  function renderExistingTreePreview() {
    const preview = document.getElementById("existingTreePreview");
    if (!preview) return;

    if (!state.tree || !state.tree.children || state.tree.children.length === 0) {
      preview.textContent = "No existing folder tree loaded yet.";
      return;
    }

    preview.textContent = window.FolderTreeRender.buildOutputLines().join("\n");
  }

  async function chooseExistingFolderTree(options = {}) {
    const {
      depthSelectId = "existingTreeDepthSelect",
      statusSelector = "#existingTreeStatusBox",
      afterLoad = renderExistingTreePreview,
      hideSelector = null,
      requiresWriteAccess = false
    } = options;
    const modeName = getActiveMode();
    const modeRevision = getActiveModeRevision();
    const modeState = getModeState(modeName);
    const initialTree = modeState.tree;
    const loadId = nextLoadId + 1;

    nextLoadId = loadId;
    activeLoadIds.set(modeName, loadId);

    const isCurrentLoad = () => (
      activeLoadIds.get(modeName) === loadId &&
      getActiveMode() === modeName &&
      getActiveModeRevision() === modeRevision &&
      getModeState(modeName) === modeState &&
      modeState.tree === initialTree
    );

    if (!window.BrowserSupport.supportsDirectoryPicker()) {
      setText(statusSelector, window.AppMessages.folderCreationUnsupported);
      return;
    }

    try {
      const maxDepth = getSelectedDepth(depthSelectId);
      const rootHandle = await window.showDirectoryPicker({
        mode: requiresWriteAccess ? "readwrite" : "read"
      });

      if (!isCurrentLoad()) return;

      const hasWriteAccess = !requiresWriteAccess ||
        await window.FolderCreation.ensureReadWritePermission(rootHandle);

      if (!isCurrentLoad()) return;

      if (!hasWriteAccess) {
        setText(statusSelector, window.FolderCreation.permissionDeniedMessage);
        return;
      }

      const counter = { count: 0 };

      const childFolders = await readFolderChildren(rootHandle, 1, maxDepth, counter);

      if (!isCurrentLoad()) return;

      resetNodeCounter(modeName);
      const tree = buildAppTree(rootHandle.name, childFolders, modeName);

      setTree(tree);
      window.FolderCreation.rememberRootHandle(rootHandle, tree.children[0].id);
      window.FolderTreeRender.renderAll();
      afterLoad?.();

      setText(
        statusSelector,
        `Existing folder tree loaded from: ${rootHandle.name}. Read ${counter.count} folder(s), up to ${maxDepth} level(s) deep.`
      );

      const panel = hideSelector ? document.querySelector(hideSelector) : null;
      if (panel) panel.hidden = true;
    } catch (error) {
      if (!isCurrentLoad()) return;

      if (error && error.name === "AbortError") {
        setText(
          statusSelector,
          requiresWriteAccess
            ? window.FolderCreation.writeAccessCancelledMessage
            : "Existing folder tree selection was cancelled."
        );
        return;
      }

      if (window.FolderCreation.isPermissionDeniedError(error)) {
        setText(statusSelector, window.FolderCreation.permissionDeniedMessage);
        return;
      }

      setText(statusSelector, "Existing folder tree could not be loaded. Please try again.");
    }
  }

  function chooseExistingFolderTreeForArchive() {
    return chooseExistingFolderTree({
      depthSelectId: "archiveTreeDepthSelect",
      statusSelector: "#archiveResultBox",
      afterLoad: window.FolderTreeRender.renderArchivePreview,
      hideSelector: "#archiveTreeChoicePanel",
      requiresWriteAccess: true
    });
  }

  function chooseExistingFolderTreeForFolderArchive() {
    return chooseExistingFolderTree({
      depthSelectId: "folderArchiveTreeDepthSelect",
      statusSelector: "#folderArchiveResultBox",
      afterLoad: window.FolderTreeRender.renderArchivePreview,
      hideSelector: "#folderArchiveTreeChoicePanel",
      requiresWriteAccess: true
    });
  }

  return {
    chooseExistingFolderTree,
    chooseExistingFolderTreeForArchive,
    chooseExistingFolderTreeForFolderArchive,
    renderExistingTreePreview,
    getArchiveDestination
  };
})();
