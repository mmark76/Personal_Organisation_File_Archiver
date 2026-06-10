/* Folder tree rendering and UI updates. */

window.FolderTreeRender = (() => {
  const { state } = window.AppState;
  const { qs } = window.AppUtils;

  function createNodeElement(node, indexPath) {
    const wrapper = document.createElement("div");
    wrapper.className = "tree-item";

    const row = document.createElement("div");
    row.className = "tree-node";
    if (node.fixed) row.classList.add("main-category-node");

    const content = document.createElement("div");
    content.className = "node-content";

    const code = document.createElement("span");
    code.className = "folder-display-code";
    code.textContent = window.FolderTreeCodes.getDisplayCodeFromIndexPath(indexPath, node);

    const name = document.createElement("span");
    name.className = "node-name";
    name.textContent = window.FolderTree.getVisibleName(node.name, node);

    content.append(code, name);

    const actions = document.createElement("div");
    actions.className = "node-actions";

    const addButton = document.createElement("button");
    addButton.type = "button";
    addButton.textContent = "+";
    addButton.setAttribute("aria-label", `Add folder under ${node.name}`);
    addButton.dataset.action = "add";
    addButton.dataset.nodeId = node.id;
    actions.appendChild(addButton);

    if (!node.fixed) {
      const deleteButton = document.createElement("button");
      deleteButton.type = "button";
      deleteButton.textContent = "×";
      deleteButton.className = "danger";
      deleteButton.setAttribute("aria-label", `Delete folder ${node.name}`);
      deleteButton.dataset.action = "delete";
      deleteButton.dataset.nodeId = node.id;
      actions.appendChild(deleteButton);
    }

    row.append(content, actions);
    wrapper.appendChild(row);

    if (node.children && node.children.length) {
      const children = document.createElement("div");
      children.className = "tree-children";
      node.children.forEach((child, index) => {
        children.appendChild(createNodeElement(child, [...indexPath, index]));
      });
      wrapper.appendChild(children);
    }

    return wrapper;
  }

  function renderTree() {
    const container = qs("#treeContainer");
    if (!container) return;

    container.innerHTML = "";
    state.tree.children.forEach((child, index) => {
      container.appendChild(createNodeElement(child, [index]));
    });
  }

  function getTextTreeLabel(node, indexPath) {
    if (node.fixed) return node.name;

    const code = window.FolderTreeCodes.getDisplayCodeFromIndexPath(indexPath, node);
    return `${code} ${node.name}`;
  }

  function buildOutputLines() {
    const lines = ["Organize Your PC"];

    function walk(node, indexPath, prefix, isLast) {
      const connector = isLast ? "└── " : "├── ";
      const childPrefix = prefix + (isLast ? "    " : "│   ");

      lines.push(`${prefix}${connector}${getTextTreeLabel(node, indexPath)}`);

      (node.children || []).forEach((child, index, siblings) => {
        walk(child, [...indexPath, index], childPrefix, index === siblings.length - 1);
      });
    }

    state.tree.children.forEach((child, index, siblings) => {
      walk(child, [index], "", index === siblings.length - 1);
    });

    return lines;
  }

  function renderOutput() {
    const output = qs("#treeOutput");
    if (output) output.textContent = buildOutputLines().join("\n");
  }

  function createArchiveNodeElement(node, indexPath) {
    const wrapper = document.createElement("div");
    wrapper.className = "archive-tree-item";

    const button = document.createElement("button");
    button.type = "button";
    button.className = "archive-destination-button";
    button.dataset.archiveNodeId = node.id;
    button.setAttribute("aria-pressed", String(state.selectedArchiveFolderId === node.id));

    if (node.fixed) button.classList.add("archive-main-destination");
    if (state.selectedArchiveFolderId === node.id) button.classList.add("archive-destination-selected");

    const code = document.createElement("span");
    code.className = "folder-display-code";
    code.textContent = window.FolderTreeCodes.getDisplayCodeFromIndexPath(indexPath, node);

    const name = document.createElement("span");
    name.className = "node-name";
    name.textContent = window.FolderTree.getVisibleName(node.name, node);

    const path = window.FolderTree.getFolderPath(node.id);
    button.setAttribute("aria-label", `Select archive destination ${path}`);
    button.append(code, name);
    wrapper.appendChild(button);

    if (node.children && node.children.length) {
      const children = document.createElement("div");
      children.className = "archive-tree-children";
      node.children.forEach((child, index) => {
        children.appendChild(createArchiveNodeElement(child, [...indexPath, index]));
      });
      wrapper.appendChild(children);
    }

    return wrapper;
  }

  function renderArchivePreview() {
    const preview = qs("#archiveTreePreview");
    if (!preview) return;

    preview.innerHTML = "";

    if (!state.tree || !state.tree.children || state.tree.children.length === 0) {
      preview.textContent = "No folder tree loaded yet.";
      return;
    }

    if (state.selectedArchiveFolderId && !window.FolderTree.findNodeById(state.selectedArchiveFolderId)) {
      state.selectedArchiveFolderId = null;
    }

    const instruction = document.createElement("p");
    instruction.className = "archive-tree-instruction";
    instruction.textContent = "Select the folder where this file should be archived.";
    preview.appendChild(instruction);

    const selectableTree = document.createElement("div");
    selectableTree.className = "archive-tree-selectable";
    state.tree.children.forEach((child, index) => {
      selectableTree.appendChild(createArchiveNodeElement(child, [index]));
    });
    preview.appendChild(selectableTree);

    const selectedNode = state.selectedArchiveFolderId
      ? window.FolderTree.findNodeById(state.selectedArchiveFolderId)
      : null;

    const selectedStatus = document.createElement("div");
    selectedStatus.className = "archive-selected-status";
    selectedStatus.textContent = selectedNode
      ? `${window.AppMessages.archiveDestinationSelected} ${window.FolderTree.getFolderPath(selectedNode.id)}`
      : window.AppMessages.noArchiveDestination;
    preview.appendChild(selectedStatus);
  }

  function renderAll() {
    renderTree();
    renderOutput();
    renderArchivePreview();
  }

  function bindTreeEvents() {
    const container = qs("#treeContainer");
    if (container) {
      container.addEventListener("click", event => {
        const button = event.target.closest("button[data-action]");
        if (!button) return;

        const action = button.dataset.action;
        const nodeId = button.dataset.nodeId;

        if (action === "add") window.FolderTree.openAddFolderModal(nodeId);
        if (action === "delete") window.FolderTree.deleteFolder(nodeId);
      });
    }

    const archivePreview = qs("#archiveTreePreview");
    if (archivePreview) {
      archivePreview.addEventListener("click", event => {
        const button = event.target.closest("button[data-archive-node-id]");
        if (!button) return;
        window.FolderTree.selectArchiveFolder(button.dataset.archiveNodeId);
      });
    }
  }

  return {
    renderTree,
    renderOutput,
    renderArchivePreview,
    renderAll,
    bindTreeEvents,
    buildOutputLines
  };
})();