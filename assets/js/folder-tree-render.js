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
    name.textContent = window.FolderTree.getVisibleName(node.name);

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

  function buildOutputLines() {
    const lines = ["DOCUMENTS"];

    function walk(node, indexPath, prefix, isLast) {
      const connector = isLast ? "└── " : "├── ";
      const childPrefix = prefix + (isLast ? "    " : "│   ");
      const code = window.FolderTreeCodes.getDisplayCodeFromIndexPath(indexPath, node);

      lines.push(`${prefix}${connector}${code} ${node.name}`);

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

  function renderArchivePreview() {
    const preview = qs("#archiveTreePreview");
    if (!preview) return;

    const lines = buildOutputLines();
    preview.textContent = lines.length > 1 ? lines.join("\n") : "No folder tree loaded yet.";
  }

  function renderAll() {
    renderTree();
    renderOutput();
    renderArchivePreview();
  }

  function bindTreeEvents() {
    const container = qs("#treeContainer");
    if (!container) return;

    container.addEventListener("click", event => {
      const button = event.target.closest("button[data-action]");
      if (!button) return;

      const action = button.dataset.action;
      const nodeId = button.dataset.nodeId;

      if (action === "add") window.FolderTree.openAddFolderModal(nodeId);
      if (action === "delete") window.FolderTree.deleteFolder(nodeId);
    });
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