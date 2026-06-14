/* User-controlled folder tree creation on the local computer. */

window.FolderCreation = (() => {
  const appRootFolderName = "Organize Your PC";
  const permissionDeniedMessage = "Read/write permission was not granted for the selected destination folder.";
  const writeAccessCancelledMessage =
    "Destination selection was cancelled or read/write permission was not granted. No files or folders were created.";
  const staleAfterWriteMessage =
    "The operation was cancelled because its context changed. The destination folder may already have been created, but no further files or folders were written.";

  function createPermissionError() {
    const error = new Error(permissionDeniedMessage);
    error.name = "NotAllowedError";
    error.code = "READ_WRITE_PERMISSION_DENIED";
    return error;
  }

  function isPermissionDeniedError(error) {
    return error?.code === "READ_WRITE_PERMISSION_DENIED" || error?.name === "NotAllowedError";
  }

  function captureModeContext() {
    const modeName = window.AppState.getActiveMode();
    const modeState = window.AppState.getModeState(modeName);

    return {
      modeName,
      modeRevision: window.AppState.getActiveModeRevision(),
      modeState,
      tree: modeState.tree
    };
  }

  function isCurrentModeContext(context) {
    return window.AppState.getActiveMode() === context.modeName &&
      window.AppState.getActiveModeRevision() === context.modeRevision &&
      window.AppState.getModeState(context.modeName) === context.modeState &&
      context.modeState.tree === context.tree;
  }

  function createStaleModeContextError(outputMayExist = false) {
    const error = new Error("The destination operation is no longer current.");
    error.name = "AbortError";
    error.code = outputMayExist ? "STALE_MODE_CONTEXT_AFTER_WRITE" : "STALE_MODE_CONTEXT";
    return error;
  }

  function requireCurrentModeContext(context, outputMayExist = false) {
    if (isCurrentModeContext(context)) return;
    throw createStaleModeContextError(outputMayExist);
  }

  function isStaleAfterWriteError(error) {
    return error?.code === "STALE_MODE_CONTEXT_AFTER_WRITE";
  }

  async function ensureReadWritePermission(directoryHandle) {
    if (!directoryHandle) return false;

    const permissionOptions = { mode: "readwrite" };
    const canQueryPermission = typeof directoryHandle.queryPermission === "function";
    const canRequestPermission = typeof directoryHandle.requestPermission === "function";
    let queriedPermission = null;

    if (canQueryPermission) {
      try {
        queriedPermission = await directoryHandle.queryPermission(permissionOptions);
        if (queriedPermission === "granted") return true;
      } catch (error) {
        queriedPermission = null;
      }
    }

    if (canRequestPermission) {
      try {
        return await directoryHandle.requestPermission(permissionOptions) === "granted";
      } catch (error) {
        return false;
      }
    }

    return canQueryPermission ? queriedPermission === "granted" : true;
  }

  async function requireReadWritePermission(directoryHandle) {
    if (!(await ensureReadWritePermission(directoryHandle))) {
      throw createPermissionError();
    }
  }

  function rememberRootHandleInState(modeState, directoryHandle, rootNodeId = null) {
    modeState.appRootHandle = directoryHandle;
    modeState.appRootTree = modeState.tree;
    modeState.appRootNodeId = rootNodeId;
  }

  function rememberRootHandle(directoryHandle, rootNodeId = null) {
    rememberRootHandleInState(window.AppState.getActiveState(), directoryHandle, rootNodeId);
  }

  async function createDirectoryPath(rootHandle, folderPath) {
    await requireReadWritePermission(rootHandle);

    const parts = folderPath.split("/").filter(Boolean);
    let currentHandle = rootHandle;

    for (const part of parts) {
      currentHandle = await currentHandle.getDirectoryHandle(part, { create: true });
    }

    return currentHandle;
  }

  async function runBeforeWriteValidation(directoryHandle, modeContext, beforeWriteValidation) {
    if (typeof beforeWriteValidation !== "function") return;
    await beforeWriteValidation(directoryHandle);
    requireCurrentModeContext(modeContext);
  }

  async function resolveAppRootHandle(selectedHandle, modeContext, beforeWriteValidation) {
    await requireReadWritePermission(selectedHandle);
    requireCurrentModeContext(modeContext);
    await runBeforeWriteValidation(selectedHandle, modeContext, beforeWriteValidation);

    if (selectedHandle.name === appRootFolderName) {
      rememberRootHandleInState(modeContext.modeState, selectedHandle);
      return selectedHandle;
    }

    const appRootHandle = await selectedHandle.getDirectoryHandle(appRootFolderName, { create: true });
    requireCurrentModeContext(modeContext, true);
    rememberRootHandleInState(modeContext.modeState, appRootHandle);
    return appRootHandle;
  }

  async function chooseAppRootHandle(modeContext = captureModeContext(), beforeWriteValidation) {
    const selectedHandle = await window.showDirectoryPicker({ mode: "readwrite" });
    requireCurrentModeContext(modeContext);
    return resolveAppRootHandle(selectedHandle, modeContext, beforeWriteValidation);
  }

  async function getOrChooseAppRootHandle(beforeWriteValidation) {
    const modeContext = captureModeContext();
    const rootHandle = modeContext.modeState.appRootHandle;

    if (rootHandle && modeContext.modeState.appRootTree === modeContext.tree) {
      await requireReadWritePermission(rootHandle);
      requireCurrentModeContext(modeContext);
      await runBeforeWriteValidation(rootHandle, modeContext, beforeWriteValidation);

      if (
        modeContext.modeState.appRootHandle !== rootHandle ||
        modeContext.modeState.appRootTree !== modeContext.tree
      ) {
        throw createStaleModeContextError();
      }

      return rootHandle;
    }

    return chooseAppRootHandle(modeContext, beforeWriteValidation);
  }

  async function createFoldersOnComputer() {
    if (!window.BrowserSupport.supportsDirectoryPicker()) {
      alert(window.AppMessages.folderCreationUnsupported);
      return;
    }

    let destinationReady = false;

    try {
      const appRootHandle = await chooseAppRootHandle();
      destinationReady = true;
      const folderPaths = window.FolderTree.getAllFolderPaths();

      for (const folderPath of folderPaths) {
        await createDirectoryPath(appRootHandle, folderPath);
      }

      alert(window.AppMessages.folderCreationComplete);
    } catch (error) {
      if (isStaleAfterWriteError(error)) {
        alert(staleAfterWriteMessage);
        return;
      }

      if (error && error.name === "AbortError") {
        alert(destinationReady ? window.AppMessages.folderCreationCancelled : writeAccessCancelledMessage);
        return;
      }

      if (isPermissionDeniedError(error)) {
        alert(permissionDeniedMessage);
        return;
      }

      alert(window.AppMessages.folderCreationFailed);
    }
  }

  return {
    appRootFolderName,
    permissionDeniedMessage,
    writeAccessCancelledMessage,
    staleAfterWriteMessage,
    ensureReadWritePermission,
    requireReadWritePermission,
    isPermissionDeniedError,
    isStaleAfterWriteError,
    rememberRootHandle,
    createDirectoryPath,
    getOrChooseAppRootHandle,
    createFoldersOnComputer
  };
})();
