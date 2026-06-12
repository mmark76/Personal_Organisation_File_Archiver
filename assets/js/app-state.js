/* Shared application state. */

window.AppState = (() => {
  const modeNames = ["buildTree", "existingTree", "archive", "archiveFolder"];

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

  const nodeCounters = {};
  let activeMode = "buildTree";

  function createEmptyTree() {
    return {
      id: "documents",
      name: "DOCUMENTS",
      fixed: true,
      branch: null,
      thinkingType: null,
      childLayerType: null,
      children: []
    };
  }

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
          name: "PROFILE",
          fixed: true,
          branch: "profile",
          thinkingType: null,
          childLayerType: null,
          children: []
        },
        {
          id: "personal",
          name: "PERSONAL",
          fixed: true,
          branch: "personal",
          thinkingType: null,
          childLayerType: null,
          children: []
        },
        {
          id: "professional",
          name: "PROFESSIONAL",
          fixed: true,
          branch: "professional",
          thinkingType: null,
          childLayerType: null,
          children: []
        }
      ]
    };
  }

  function createModeState(modeName) {
    return {
      tree: modeName === "buildTree" ? createFixedTree() : createEmptyTree(),
      selectedParentId: null,
      selectedArchiveFolderId: null,
      loadedFile: null,
      loadedFolderHandle: null,
      loadedFolderName: null,
      appRootHandle: null,
      lastFocusedElement: null
    };
  }

  const states = modeNames.reduce((result, modeName) => {
    result[modeName] = createModeState(modeName);
    nodeCounters[modeName] = 1;
    return result;
  }, {});

  function normalizeModeName(modeName = activeMode) {
    return modeNames.includes(modeName) ? modeName : activeMode;
  }

  function getModeState(modeName = activeMode) {
    return states[normalizeModeName(modeName)];
  }

  function getActiveState() {
    return getModeState(activeMode);
  }

  const state = new Proxy({}, {
    get(_target, property) {
      return getActiveState()[property];
    },
    set(_target, property, value) {
      getActiveState()[property] = value;
      return true;
    },
    has(_target, property) {
      return property in getActiveState();
    },
    ownKeys() {
      return Reflect.ownKeys(getActiveState());
    },
    getOwnPropertyDescriptor(_target, property) {
      const descriptor = Object.getOwnPropertyDescriptor(getActiveState(), property);
      if (!descriptor) return undefined;
      return { ...descriptor, configurable: true };
    }
  });

  function setActiveMode(modeName) {
    if (!modeNames.includes(modeName)) return activeMode;
    activeMode = modeName;
    return activeMode;
  }

  function getActiveMode() {
    return activeMode;
  }

  function withMode(modeName, callback) {
    const previousMode = activeMode;
    setActiveMode(modeName);

    try {
      return callback(getActiveState());
    } finally {
      setActiveMode(previousMode);
    }
  }

  function getNextNodeId(modeName = activeMode) {
    const mode = normalizeModeName(modeName);
    const id = `node_${nodeCounters[mode]}`;
    nodeCounters[mode] += 1;
    return id;
  }

  function resetNodeCounter(modeName = activeMode) {
    nodeCounters[normalizeModeName(modeName)] = 1;
  }

  function resetMode(modeName = activeMode) {
    const mode = normalizeModeName(modeName);
    resetNodeCounter(mode);
    states[mode] = createModeState(mode);
  }

  function resetTree() {
    resetNodeCounter();
    const currentState = getActiveState();
    currentState.tree = activeMode === "buildTree" ? createFixedTree() : createEmptyTree();
    currentState.selectedParentId = null;
    currentState.selectedArchiveFolderId = null;
  }

  function setTree(tree) {
    const currentState = getActiveState();
    currentState.tree = tree;
    currentState.selectedParentId = null;
    currentState.selectedArchiveFolderId = null;
  }

  function setLoadedFile(file) {
    getActiveState().loadedFile = file;
  }

  function setLoadedFolder(handle) {
    const currentState = getActiveState();
    currentState.loadedFolderHandle = handle || null;
    currentState.loadedFolderName = handle ? handle.name : null;
  }

  function setAppRootHandle(handle) {
    getActiveState().appRootHandle = handle;
  }

  return {
    state,
    states,
    thinkingTypes,
    setActiveMode,
    getActiveMode,
    getModeState,
    getActiveState,
    withMode,
    getNextNodeId,
    resetNodeCounter,
    resetMode,
    resetTree,
    setTree,
    setLoadedFile,
    setLoadedFolder,
    setAppRootHandle,
    createEmptyTree,
    createFixedTree
  };
})();
