/* User-controlled folder tree creation on the local computer. */

window.FolderCreation = (() => {
  const appRootFolderName = "Organize Your PC";

  async function createDirectoryPath(rootHandle, folderPath) {
    const parts = folderPath.split("/").filter(Boolean);
    let currentHandle = rootHandle;

    for (const part of parts) {
      currentHandle = await currentHandle.getDirectoryHandle(part, { create: true });
    }
  }

  async function createFoldersOnComputer() {
    if (!window.BrowserSupport.supportsDirectoryPicker()) {
      alert(window.AppMessages.folderCreationUnsupported);
      return;
    }

    try {
      const selectedRootHandle = await window.showDirectoryPicker();
      const appRootHandle = await selectedRootHandle.getDirectoryHandle(appRootFolderName, { create: true });
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

      alert(window.AppMessages.archiveFailed);
    }
  }

  return {
    createFoldersOnComputer
  };
})();
