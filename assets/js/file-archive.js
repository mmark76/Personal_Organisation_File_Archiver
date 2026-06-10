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
      return false;
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
    const file = window.AppState.state.loadedFile;

    if (!file) {
      window.AppUtils.setText("#archiveResultBox", window.AppMessages.noFileLoaded);
      return;
    }

    if (!window.BrowserSupport.supportsDirectoryPicker()) {
      window.AppUtils.setText("#archiveResultBox", window.AppMessages.archiveUnsupported);
      return;
    }

    try {
      const destinationHandle = await window.showDirectoryPicker();
      const safeName = await getAvailableFileName(destinationHandle, file.name);
      const fileHandle = await destinationHandle.getFileHandle(safeName, { create: true });
      const writable = await fileHandle.createWritable();

      await writable.write(file);
      await writable.close();

      window.AppUtils.setText("#archiveResultBox", `${window.AppMessages.archiveComplete} Saved as: ${safeName}`);
    } catch (error) {
      if (error && error.name === "AbortError") {
        window.AppUtils.setText("#archiveResultBox", window.AppMessages.archiveCancelled);
        return;
      }

      window.AppUtils.setText("#archiveResultBox", window.AppMessages.archiveFailed);
    }
  }

  return {
    archiveLoadedFile
  };
})();
