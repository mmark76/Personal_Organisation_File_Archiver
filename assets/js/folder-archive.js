/* User-controlled recursive folder copy archive action. */

window.FolderArchive = (() => {
  const resultSelector = "#folderArchiveResultBox";
  const destinationInsideSourceMessage = "Archive destination cannot be inside the source folder. Please choose a destination outside the folder you are archiving.";

  function setResult(message) {
    window.AppUtils.setText(resultSelector, message);
  }

  async function handleExists(directoryHandle, name, kind) {
    try {
      if (kind === "directory") {
        await directoryHandle.getDirectoryHandle(name);
      } else {
        await directoryHandle.getFileHandle(name);
      }
      return true;
    } catch (error) {
      if (error && error.name === "NotFoundError") return false;
      throw error;
    }
  }

  async function isSameDirectory(firstHandle, secondHandle) {
    if (!firstHandle || !secondHandle || typeof firstHandle.isSameEntry !== "function") {
      return false;
    }

    try {
      return await firstHandle.isSameEntry(secondHandle);
    } catch (error) {
      return false;
    }
  }

  async function isSameOrDescendantDirectory(parentDirectoryHandle, possibleChildDirectoryHandle) {
    if (!parentDirectoryHandle || !possibleChildDirectoryHandle || typeof parentDirectoryHandle.resolve !== "function") {
      return false;
    }

    try {
      const relativePath = await parentDirectoryHandle.resolve(possibleChildDirectoryHandle);
      return Array.isArray(relativePath);
    } catch (error) {
      return false;
    }
  }

  function splitFileName(filename) {
    const dotIndex = filename.lastIndexOf(".");
    if (dotIndex <= 0) return { base: filename, extension: "" };
    return {
      base: filename.slice(0, dotIndex),
      extension: filename.slice(dotIndex)
    };
  }

  async function getAvailableFileName(directoryHandle, filename) {
    if (!(await handleExists(directoryHandle, filename, "file"))) return filename;

    const { base, extension } = splitFileName(filename);
    let counter = 1;
    let candidate = `${base}_copy_${counter}${extension}`;

    while (await handleExists(directoryHandle, candidate, "file")) {
      counter += 1;
      candidate = `${base}_copy_${counter}${extension}`;
    }

    return candidate;
  }

  async function getAvailableDirectoryName(directoryHandle, folderName) {
    if (!(await handleExists(directoryHandle, folderName, "directory"))) return folderName;

    let counter = 1;
    let candidate = `${folderName}_copy_${counter}`;

    while (await handleExists(directoryHandle, candidate, "directory")) {
      counter += 1;
      candidate = `${folderName}_copy_${counter}`;
    }

    return candidate;
  }

  async function copyFileToDirectory(sourceFileHandle, targetDirectoryHandle, stats) {
    const file = await sourceFileHandle.getFile();
    const safeName = await getAvailableFileName(targetDirectoryHandle, file.name);
    const targetFileHandle = await targetDirectoryHandle.getFileHandle(safeName, { create: true });
    const writable = await targetFileHandle.createWritable();

    try {
      await writable.write(file);
    } finally {
      await writable.close();
    }

    stats.files += 1;
    stats.bytes += file.size || 0;
  }

  async function copyDirectoryContents(sourceDirectoryHandle, targetDirectoryHandle, stats, rootTargetDirectoryHandle) {
    for await (const [name, handle] of sourceDirectoryHandle.entries()) {
      if (handle.kind === "file") {
        await copyFileToDirectory(handle, targetDirectoryHandle, stats);
        continue;
      }

      if (handle.kind === "directory") {
        if (await isSameDirectory(handle, rootTargetDirectoryHandle)) {
          continue;
        }

        const safeDirectoryName = await getAvailableDirectoryName(targetDirectoryHandle, name);
        const childTargetHandle = await targetDirectoryHandle.getDirectoryHandle(safeDirectoryName, { create: true });
        stats.folders += 1;
        await copyDirectoryContents(handle, childTargetHandle, stats, rootTargetDirectoryHandle);
      }
    }
  }

  function renderFolderStatus() {
    const box = document.getElementById("folderArchiveStatusBox");
    if (!box) return;

    const folderName = window.AppState.state.loadedFolderName;
    box.textContent = folderName
      ? `${window.AppMessages.folderLoaded} ${folderName}`
      : window.AppMessages.noFolderLoaded;
  }

  async function chooseFolderToArchive() {
    if (!window.BrowserSupport.supportsDirectoryPicker()) {
      setResult(window.AppMessages.folderArchiveUnsupported);
      return;
    }

    try {
      const folderHandle = await window.showDirectoryPicker({ mode: "read" });
      window.AppState.setLoadedFolder(folderHandle);
      renderFolderStatus();
      setResult(`${window.AppMessages.folderLoaded} ${folderHandle.name}`);
    } catch (error) {
      if (error && error.name === "AbortError") {
        setResult("Folder selection was cancelled.");
        return;
      }

      setResult("Folder could not be loaded. Please try again.");
    }
  }

  async function archiveLoadedFolder() {
    const folderHandle = window.AppState.state.loadedFolderHandle;

    if (!folderHandle) {
      setResult(window.AppMessages.noFolderLoaded);
      return;
    }

    const selectedNodeId = window.AppState.state.selectedArchiveFolderId;
    const selectedNode = selectedNodeId ? window.FolderTree.findNodeById(selectedNodeId) : null;

    if (!selectedNode) {
      setResult(window.AppMessages.noArchiveDestination);
      return;
    }

    if (!window.BrowserSupport.supportsDirectoryPicker()) {
      setResult(window.AppMessages.folderArchiveUnsupported);
      return;
    }

    let destinationReady = false;

    try {
      const destination = window.FolderTreeExisting.getArchiveDestination(selectedNode.id);
      setResult(window.AppMessages.archiveRootPrompt);

      const appRootHandle = await window.FolderCreation.getOrChooseAppRootHandle();
      destinationReady = true;
      if (await isSameOrDescendantDirectory(folderHandle, appRootHandle)) {
        setResult(destinationInsideSourceMessage);
        return;
      }

      const destinationHandle = await window.FolderCreation.createDirectoryPath(appRootHandle, destination.relativePath);
      if (await isSameOrDescendantDirectory(folderHandle, destinationHandle)) {
        setResult(destinationInsideSourceMessage);
        return;
      }

      const safeFolderName = await getAvailableDirectoryName(destinationHandle, folderHandle.name);
      const targetFolderHandle = await destinationHandle.getDirectoryHandle(safeFolderName, { create: true });
      const stats = { files: 0, folders: 1, bytes: 0 };

      await copyDirectoryContents(folderHandle, targetFolderHandle, stats, targetFolderHandle);

      setResult(
        `${window.AppMessages.folderArchiveComplete} Saved to: ${[destination.displayPath, safeFolderName].filter(Boolean).join("/")}. Copied ${stats.files} file(s) and ${stats.folders} folder(s).`
      );
    } catch (error) {
      if (window.FolderCreation.isStaleAfterWriteError(error)) {
        setResult(window.FolderCreation.staleAfterWriteMessage);
        return;
      }

      if (error && error.name === "AbortError") {
        setResult(
          destinationReady
            ? window.AppMessages.archiveCancelled
            : window.FolderCreation.writeAccessCancelledMessage
        );
        return;
      }

      if (window.FolderCreation.isPermissionDeniedError(error)) {
        setResult(window.FolderCreation.permissionDeniedMessage);
        return;
      }

      setResult(window.AppMessages.folderArchiveFailed);
    }
  }

  return {
    chooseFolderToArchive,
    archiveLoadedFolder,
    renderFolderStatus
  };
})();
