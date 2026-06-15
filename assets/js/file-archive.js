/* User-controlled file copy archive action. */

window.FileArchive = (() => {
  const rollbackUnsupportedMessage = "This browser cannot safely remove an incomplete file archive. The archive was not started. Please copy the file manually using File Explorer.";
  const archiveRolledBackMessage = "File archiving failed and was cancelled completely. The incomplete archived file was removed, so no partial copy remains.";

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

  async function rollbackArchiveTarget(archiveTarget) {
    if (!archiveTarget) return true;

    try {
      await archiveTarget.parentHandle.removeEntry(archiveTarget.name);
      return !(await fileExists(archiveTarget.parentHandle, archiveTarget.name));
    } catch (error) {
      return false;
    }
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
      let archiveTarget = null;

      try {
        const destination = window.FolderTreeExisting.getArchiveDestination(selectedNode.id);
        window.AppUtils.setText(resultSelector, window.AppMessages.archiveRootPrompt);

        const appRootHandle = await window.FolderCreation.getOrChooseAppRootHandle();
        destinationReady = true;
        const destinationHandle = await window.FolderCreation.createDirectoryPath(appRootHandle, destination.relativePath);
        if (typeof destinationHandle.removeEntry !== "function") {
          window.AppUtils.setText(resultSelector, rollbackUnsupportedMessage);
          return;
        }

        const safeName = await getAvailableFileName(destinationHandle, file.name);
        const fileHandle = await destinationHandle.getFileHandle(safeName, { create: true });
        archiveTarget = {
          parentHandle: destinationHandle,
          name: safeName,
          displayPath: [destination.displayPath, safeName].filter(Boolean).join("/")
        };
        const writable = await fileHandle.createWritable();

        try {
          await writable.write(file);
          await writable.close();
        } catch (error) {
          try {
            await writable.abort?.(error);
          } catch (abortError) {
            // Preserve the original write or close error.
          }

          throw error;
        }

        archiveTarget = null;

        window.AppUtils.setText(
          resultSelector,
          `${window.AppMessages.archiveComplete} Saved to: ${[destination.displayPath, safeName].filter(Boolean).join("/")}`
        );
        window.AppAnalytics?.trackEvent("file_archive_completed");
      } catch (error) {
        if (archiveTarget) {
          window.AppAnalytics?.trackEvent("archive_failed", { archive_type: "file" });
          if (await rollbackArchiveTarget(archiveTarget)) {
            window.AppUtils.setText(resultSelector, archiveRolledBackMessage);
          } else {
            window.AppUtils.setText(
              resultSelector,
              `File archiving failed, and the incomplete archived file could not be removed automatically. Partial output may remain at: ${archiveTarget.displayPath}. Please remove it manually before trying again.`
            );
          }
          return;
        }

        if (window.FolderCreation.isStaleAfterWriteError(error)) {
          window.AppAnalytics?.trackEvent("archive_failed", { archive_type: "file" });
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

        window.AppAnalytics?.trackEvent("archive_failed", { archive_type: "file" });
        window.AppUtils.setText(resultSelector, window.AppMessages.archiveFailed);
      }
    });
  }

  return {
    archiveLoadedFile
  };
})();
