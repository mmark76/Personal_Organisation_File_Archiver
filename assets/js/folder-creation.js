/* User-controlled folder tree creation on the local computer. */

window.FolderCreation = (() => {
  const appRootFolderName = "Organize Your PC";

  async function createDirectoryPath(rootHandle, folderPath) {
    const parts = folderPath.split("/").filter(Boolean);
    let currentHandle = rootHandle;

    for (const part of parts) {
      currentHandle = await currentHandle.getDirectoryHandle(part, { create: true });
    }

    return currentHandle;
  }

  async function resolveAppRootHandle(selectedHandle) {
    if (selectedHandle.name === appRootFolderName) {
      window.AppState.setAppRootHandle(selectedHandle);
      return selectedHandle;
    }

    const appRootHandle = await selectedHandle.getDirectoryHandle(appRootFolderName, { create: true });
    window.AppState.setAppRootHandle(appRootHandle);
    return appRootHandle;
  }

  async function chooseAppRootHandle() {
    const selectedHandle = await window.showDirectoryPicker();
    return resolveAppRootHandle(selectedHandle);
  }

  async function getOrChooseAppRootHandle() {
    if (window.AppState.state.appRootHandle) {
      return window.AppState.state.appRootHandle;
    }

    return chooseAppRootHandle();
  }

  async function createFoldersOnComputer() {
    if (!window.BrowserSupport.supportsDirectoryPicker()) {
      alert(window.AppMessages.folderCreationUnsupported);
      return;
    }

    try {
      const appRootHandle = await chooseAppRootHandle();
      const folderPaths = window.FolderTree.getAllFolderPaths();

      for (const folderPath of folderPaths) {
        await createDirectoryPath(appRootHandle, folderPath);
      }

      alert(window.AppMessages.folderCreationComplete);
    } catch (error) {
      if (error && error.name === "AbortError") {
        alert(window.AppMessages.folderCreationCancelled);
        return;
      }

      alert(window.AppMessages.folderCreationFailed);
    }
  }

  return {
    appRootFolderName,
    createDirectoryPath,
    getOrChooseAppRootHandle,
    createFoldersOnComputer
  };
})();