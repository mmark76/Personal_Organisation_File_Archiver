/* User-controlled recursive folder copy archive action. */

window.FolderArchive = (() => {
  const resultSelector = "#folderArchiveResultBox";
  const destinationInsideSourceMessage = "Archive destination cannot be inside the source folder. Please choose a destination outside the folder you are archiving.";
  const destinationRelationshipUnknownMessage = "The app could not safely verify that the destination is outside the source folder. No files or folders were created. Please choose a different destination or copy the folder manually using File Explorer.";
  const rollbackUnsupportedMessage = "This browser cannot safely remove an incomplete folder archive. The archive was not started. Please copy the folder manually using File Explorer.";
  const archiveRolledBackMessage = "Folder archiving failed and was cancelled completely. The incomplete archived folder was removed, so no copied files or folders remain.";
  const archiveLimits = Object.freeze({
    maxFiles: 2000,
    maxTotalBytes: 1024 * 1024 * 1024,
    maxFileBytes: 500 * 1024 * 1024,
    maxDepth: 20,
    maxScannedEntries: 5000
  });

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

  function createDestinationRelationshipError(code, message) {
    const error = new Error(message);
    error.code = code;
    return error;
  }

  async function requireDestinationOutsideSource(sourceDirectoryHandle, destinationDirectoryHandle) {
    if (!sourceDirectoryHandle || !destinationDirectoryHandle || typeof sourceDirectoryHandle.resolve !== "function") {
      throw createDestinationRelationshipError(
        "DESTINATION_RELATIONSHIP_UNVERIFIED",
        destinationRelationshipUnknownMessage
      );
    }

    let relativePath;
    try {
      relativePath = await sourceDirectoryHandle.resolve(destinationDirectoryHandle);
    } catch (error) {
      throw createDestinationRelationshipError(
        "DESTINATION_RELATIONSHIP_UNVERIFIED",
        destinationRelationshipUnknownMessage
      );
    }

    if (Array.isArray(relativePath)) {
      throw createDestinationRelationshipError(
        "DESTINATION_INSIDE_SOURCE",
        destinationInsideSourceMessage
      );
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

  function createFolderTooLargeResult(reason) {
    return {
      allowed: false,
      message: `This folder is too large to archive safely with this app (${reason}). No files or folders were created. Please copy it manually using Copy and Paste in File Explorer.`
    };
  }

  async function inspectFolderForArchive(rootDirectoryHandle) {
    const pendingDirectories = [{ handle: rootDirectoryHandle, depth: 0 }];
    let nextDirectoryIndex = 0;
    let fileCount = 0;
    let totalBytes = 0;
    let scannedEntries = 0;

    while (nextDirectoryIndex < pendingDirectories.length) {
      const { handle: directoryHandle, depth } = pendingDirectories[nextDirectoryIndex];
      nextDirectoryIndex += 1;

      for await (const [, handle] of directoryHandle.entries()) {
        scannedEntries += 1;
        if (scannedEntries > archiveLimits.maxScannedEntries) {
          return createFolderTooLargeResult("it contains more than 5,000 files and folders");
        }

        if (handle.kind === "directory") {
          const childDepth = depth + 1;
          if (childDepth > archiveLimits.maxDepth) {
            return createFolderTooLargeResult("its folder nesting is deeper than 20 levels");
          }

          pendingDirectories.push({ handle, depth: childDepth });
          continue;
        }

        if (handle.kind !== "file") continue;

        fileCount += 1;
        if (fileCount > archiveLimits.maxFiles) {
          return createFolderTooLargeResult("it contains more than 2,000 files");
        }

        const file = await handle.getFile();
        const fileSize = Number.isFinite(file.size) ? file.size : 0;
        if (fileSize > archiveLimits.maxFileBytes) {
          return createFolderTooLargeResult("one file is larger than 500 MB");
        }

        totalBytes += fileSize;
        if (totalBytes > archiveLimits.maxTotalBytes) {
          return createFolderTooLargeResult("its total size is larger than 1 GB");
        }
      }
    }

    return { allowed: true };
  }

  async function copyFileToDirectory(sourceFileHandle, targetDirectoryHandle, stats) {
    const file = await sourceFileHandle.getFile();
    const safeName = await getAvailableFileName(targetDirectoryHandle, file.name);
    const targetFileHandle = await targetDirectoryHandle.getFileHandle(safeName, { create: true });
    const writable = await targetFileHandle.createWritable();

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

    stats.files += 1;
    stats.bytes += file.size || 0;
  }

  async function copyDirectoryContents(sourceDirectoryHandle, targetDirectoryHandle, stats) {
    for await (const [name, handle] of sourceDirectoryHandle.entries()) {
      if (handle.kind === "file") {
        await copyFileToDirectory(handle, targetDirectoryHandle, stats);
        continue;
      }

      if (handle.kind === "directory") {
        const safeDirectoryName = await getAvailableDirectoryName(targetDirectoryHandle, name);
        const childTargetHandle = await targetDirectoryHandle.getDirectoryHandle(safeDirectoryName, { create: true });
        stats.folders += 1;
        await copyDirectoryContents(handle, childTargetHandle, stats);
      }
    }
  }

  async function rollbackArchiveTarget(archiveTarget) {
    if (!archiveTarget) return true;

    try {
      await archiveTarget.parentHandle.removeEntry(archiveTarget.name, { recursive: true });
      return !(await handleExists(archiveTarget.parentHandle, archiveTarget.name, "directory"));
    } catch (error) {
      return false;
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
    let archiveTarget = null;

    try {
      setResult("Checking folder size before archiving. No files or folders have been created yet.");
      const inspection = await inspectFolderForArchive(folderHandle);
      if (!inspection.allowed) {
        setResult(inspection.message);
        return;
      }

      const destination = window.FolderTreeExisting.getArchiveDestination(selectedNode.id);
      setResult(window.AppMessages.archiveRootPrompt);

      const appRootHandle = await window.FolderCreation.getOrChooseAppRootHandle(
        candidateHandle => requireDestinationOutsideSource(folderHandle, candidateHandle)
      );
      destinationReady = true;

      const destinationHandle = await window.FolderCreation.createDirectoryPath(appRootHandle, destination.relativePath);
      if (typeof destinationHandle.removeEntry !== "function") {
        setResult(rollbackUnsupportedMessage);
        return;
      }

      const safeFolderName = await getAvailableDirectoryName(destinationHandle, folderHandle.name);
      const targetFolderHandle = await destinationHandle.getDirectoryHandle(safeFolderName, { create: true });
      archiveTarget = {
        parentHandle: destinationHandle,
        name: safeFolderName,
        displayPath: [destination.displayPath, safeFolderName].filter(Boolean).join("/")
      };
      const stats = { files: 0, folders: 1, bytes: 0 };

      await copyDirectoryContents(folderHandle, targetFolderHandle, stats);

      setResult(
        `${window.AppMessages.folderArchiveComplete} Saved to: ${[destination.displayPath, safeFolderName].filter(Boolean).join("/")}. Copied ${stats.files} file(s) and ${stats.folders} folder(s).`
      );
    } catch (error) {
      if (archiveTarget) {
        if (await rollbackArchiveTarget(archiveTarget)) {
          setResult(archiveRolledBackMessage);
        } else {
          setResult(`Folder archiving failed, and the incomplete archived folder could not be removed automatically. Partial output may remain at: ${archiveTarget.displayPath}. Please remove it manually before trying again.`);
        }
        return;
      }

      if (error?.code === "DESTINATION_INSIDE_SOURCE" || error?.code === "DESTINATION_RELATIONSHIP_UNVERIFIED") {
        setResult(error.message);
        return;
      }

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
