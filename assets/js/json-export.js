function cloneFolderNodeForExport(node) {
  return {
    name: node.name,
    fixed: Boolean(node.fixed),
    branch: node.branch || null,
    thinkingType: node.thinkingType || null,
    childLayerType: node.childLayerType || null,
    children: (node.children || []).map(cloneFolderNodeForExport)
  };
}

function downloadStructureJson() {
  const exportData = {
    app: "Organize Your PC",
    type: "personal-memory-based-folder-tree",
    schemaVersion: 1,
    exportedAt: new Date().toISOString(),
    folderTree: cloneFolderNodeForExport(tree)
  };

  downloadFile(
    "folder_tree_template.json",
    JSON.stringify(exportData, null, 2),
    "application/json;charset=utf-8"
  );
}
