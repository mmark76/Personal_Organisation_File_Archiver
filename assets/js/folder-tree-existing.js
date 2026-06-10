/* Build a folder tree from an existing local folder chosen by the user. */

window.FolderTreeExisting = (() => {
  const { state, getNextNodeId, resetNodeCounter, setTree } = window.AppState;
  const { setText } = window.AppUtils;

  function createImportedNode(name, children = []) {
    return {
      id: getNextNodeId(),
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

      folders.push(createImportedNode(name, children));
    }

    folders.sort((a, b) => a.name.localeCompare(b.name));
    return folders;
  }

  function buildAppTree(rootFolderName, childNodes) {
    resetNodeCounter();

    const rootNode = createImportedNode(
      rootFolderName || "SELECTED_FOLDER",
      childNodes
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
      hideSelector = null
    } = options;

    if (!window.BrowserSupport.supportsDirectoryPicker()) {
      setText(statusSelector, window.AppMessages.folderCreationUnsupported);
      return;
    }

    try {
      const maxDepth = getSelectedDepth(depthSelectId);
      const rootHandle = await window.showDirectoryPicker({ mode: "read" });
      const counter = { count: 0 };
      const childNodes = await readFolderChildren(rootHandle, 1, maxDepth, counter);
      const tree = buildAppTree(rootHandle.name, childNodes);

      setTree(tree);
      window.FolderTreeRender.renderAll();
      afterLoad?.();

      setText(
        statusSelector,
        `Existing folder tree loaded from: ${rootHandle.name}. Read ${counter.count} folder(s), up to ${maxDepth} level(s) deep.`
      );

      const panel = hideSelector ? document.querySelector(hideSelector) : null;
      if (panel) panel.hidden = true;
    } catch (error) {
      if (error && error.name === "AbortError") {
        setText(statusSelector, "Existing folder tree selection was cancelled.");
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
      hideSelector: "#archiveTreeChoicePanel"
    });
  }

  return {
    chooseExistingFolderTree,
    chooseExistingFolderTreeForArchive,
    renderExistingTreePreview
  };
})();
