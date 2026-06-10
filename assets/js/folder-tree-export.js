/* Folder tree export, download, and copy actions. */

window.FolderTreeExport = (() => {
  const { state } = window.AppState;
  const { downloadTextFile, writeClipboard } = window.AppUtils;

  function cloneNode(node) {
    return {
      name: node.name,
      fixed: Boolean(node.fixed),
      branch: node.branch || null,
      thinkingType: node.thinkingType || null,
      childLayerType: node.childLayerType || null,
      children: (node.children || []).map(cloneNode)
    };
  }

  function buildExportData() {
    return {
      app: "Organize Your PC",
      type: "personal-memory-based-folder-tree",
      schemaVersion: 1,
      exportedAt: new Date().toISOString(),
      folderTree: cloneNode(state.tree)
    };
  }

  function exportFolderTreeJson() {
    const content = JSON.stringify(buildExportData(), null, 2);
    downloadTextFile("folder_tree_template.json", content, "application/json;charset=utf-8");
  }

  async function copyFolderTreeText() {
    const text = window.FolderTreeRender.buildOutputLines().join("\n");

    try {
      await writeClipboard(text);
      alert(window.AppMessages.folderTreeCopied);
    } catch (error) {
      alert(window.AppMessages.folderTreeCopyFailed);
    }
  }

  return {
    buildExportData,
    exportFolderTreeJson,
    copyFolderTreeText
  };
})();
