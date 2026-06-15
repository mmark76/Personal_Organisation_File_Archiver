/* User-controlled file copy archive action. */

window.FileArchive = (() => {
  function splitFileName(filename) {
    const dotIndex = filename.lastIndexOf(".");
    if (dotIndex <= 0) return { base: filename, extension: "" };
    return {
      base: filename.slice(0, dotIndex),
      extension: filename.slice(dotIndex)
    };
  }

  async function fileExists(directoryHandle, filename) {
    try {
      await directoryHandle.getFileHandle(filename);
      return true;
    } catch (error) {
      if (error && error.name === "NotFoundError") return false;
      throw error;
    }
  }

  async function getAvailableFileName(directoryHandle, filename) {
    if (!(await fileExists(directoryHandle, filename))) return filename;

    const { base, extension } = splitFileName(filename);
    let counter = 1;
    let candidate = `${base}_copy_${counter}${extension}`;

    while (await fileExists(directoryHandle, candidate)) {
      counter += 1;
      candidate = `${base}_copy_${counter}${extension}`;
    }

    return candidate;
  }

  async function archiveLoadedFile() {
    const resultSelector = "#archiveResultBox";
    if (window.ArchiveOperation.reportIfBusy(resultSelector)) return;

    const file = window.AppState.state.loadedFile;

    if (!file) {
      window.AppUtils.setText(resultSelector, window.AppMessages.noFileLoaded);
      return;
    }

    const selectedNodeId = window.AppState.state.selectedArchiveFolderId;
    const selectedNode = selectedNodeId ? window.FolderTree.findNodeById(selectedNodeId) : null;

    if (!selectedNode) {
      window.AppUtils.setText(resultSelector, window.AppMessages.noArchiveDestination);
      return;
    }

    if (!window.BrowserSupport.supportsDirectoryPicker()) {
      window.AppUtils.setText(resultSelector, window.AppMessages.archiveUnsupported);
      return;
    }

    return window.ArchiveOperation.runExclusive(resultSelector, async () => {
      let destinationReady = false;

      try {
        const destination = window.FolderTreeExisting.getArchiveDestination(selectedNode.id);
        window.AppUtils.setText(resultSelector, window.AppMessages.archiveRootPrompt);

        const appRootHandle = await window.FolderCreation.getOrChooseAppRootHandle();
        destinationReady = true;
        const destinationHandle = await window.FolderCreation.createDirectoryPath(appRootHandle, destination.relativePath);
        const safeName = await getAvailableFileName(destinationHandle, file.name);
        const fileHandle = await destinationHandle.getFileHandle(safeName, { create: true });
        const writable = await fileHandle.createWritable();

        try {
          await writable.write(file);
        } finally {
          await writable.close();
        }

        window.AppUtils.setText(
          resultSelector,
          `${window.AppMessages.archiveComplete} Saved to: ${[destination.displayPath, safeName].filter(Boolean).join("/")}`
        );
      } catch (error) {
        if (window.FolderCreation.isStaleAfterWriteError(error)) {
          window.AppUtils.setText(resultSelector, window.FolderCreation.staleAfterWriteMessage);
          return;
        }

        if (error && error.name === "AbortError") {
          window.AppUtils.setText(
            resultSelector,
            destinationReady
              ? window.AppMessages.archiveCancelled
              : window.FolderCreation.writeAccessCancelledMessage
          );
          return;
        }

        if (window.FolderCreation.isPermissionDeniedError(error)) {
          window.AppUtils.setText(resultSelector, window.FolderCreation.permissionDeniedMessage);
          return;
        }

        window.AppUtils.setText(resultSelector, window.AppMessages.archiveFailed);
      }
    });
  }

  return {
    archiveLoadedFile
  };
})();