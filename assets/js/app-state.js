/* Shared application state. */

window.AppState = (() => {
  const thinkingTypes = {
    "001_CHRONOLOGICAL": {
      label: "001 - Chronological",
      prompt: "Use a period, year range, or life phase."
    },
    "002_THEMATIC": {
      label: "002 - Thematic",
      prompt: "Use a subject or topic."
    },
    "003_FUNCTIONAL": {
      label: "003 - Functional",
      prompt: "Use a practical purpose or function."
    },
    "004_ROLE_BASED": {
      label: "004 - Role-based",
      prompt: "Use a role, duty, or responsibility."
    }
  };

  let nextNodeId = 1;

  function createFixedTree() {
    return {
      id: "documents",
      name: "DOCUMENTS",
      fixed: true,
      branch: null,
      thinkingType: null,
      childLayerType: null,
      children: [
        {
          id: "profile",
          name: "01_PROFILE",
          fixed: true,
          branch: "profile",
          thinkingType: null,
          childLayerType: null,
          children: []
        },
        {
          id: "personal",
          name: "02_PERSONAL",
          fixed: true,
          branch: "personal",
          thinkingType: null,
          childLayerType: null,
          children: []
        },
        {
          id: "professional",
          name: "03_PROFESSIONAL",
          fixed: true,
          branch: "professional",
          thinkingType: null,
          childLayerType: null,
          children: []
        }
      ]
    };
  }

  const state = {
    tree: createFixedTree(),
    selectedParentId: null,
    loadedFile: null,
    lastFocusedElement: null
  };

  function getNextNodeId() {
    const id = `node_${nextNodeId}`;
    nextNodeId += 1;
    return id;
  }

  function resetNodeCounter() {
    nextNodeId = 1;
  }

  function resetTree() {
    resetNodeCounter();
    state.tree = createFixedTree();
    state.selectedParentId = null;
  }

  function setTree(tree) {
    state.tree = tree;
    state.selectedParentId = null;
  }

  function setLoadedFile(file) {
    state.loadedFile = file;
  }

  return {
    state,
    thinkingTypes,
    getNextNodeId,
    resetNodeCounter,
    resetTree,
    setTree,
    setLoadedFile,
    createFixedTree
  };
})();
