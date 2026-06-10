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

  function buildAppTree(rootFolderName, childFolderNames) {
    resetNodeCounter();

    const rootNode = createImportedNode(
      rootFolderName || "SELECTED_FOLDER",
      childFolderNames.map(name => createImportedNode(name))
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

  async function chooseExistingFolderTree() {
    if (!window.BrowserSupport.supportsDirectoryPicker()) {
      setText("#existingTreeStatusBox", window.AppMessages.folderCreationUnsupported);
      return;
    }

    try {
      const rootHandle = await window.showDirectoryPicker({ mode: "read" });
      const childFolderNames = [];

      for await (const [name, handle] of rootHandle.entries()) {
        if (handle.kind === "directory") childFolderNames.push(name);
      }

      childFolderNames.sort((a, b) => a.localeCompare(b));

      const tree = buildAppTree(rootHandle.name, childFolderNames);
      setTree(tree);
      window.FolderTreeRender.renderAll();
      renderExistingTreePreview();

      setText(
        "#existingTreeStatusBox",
        `Existing folder tree loaded from: ${rootHandle.name}. Read ${childFolderNames.length} first-level folder(s).`
      );
    } catch (error) {
      if (error && error.name === "AbortError") {
        setText("#existingTreeStatusBox", "Existing folder tree selection was cancelled.");
        return;
      }

      setText("#existingTreeStatusBox", "Existing folder tree could not be loaded. Please try again.");
    }
  }

  return {
    chooseExistingFolderTree,
    renderExistingTreePreview
  };
})();
