/* Shared file system utilities to reduce code duplication. */

window.FileSystemUtils = (() => {
  /**
   * Check if a file exists in a directory
   * @param {FileSystemDirectoryHandle} directoryHandle - Directory handle
   * @param {string} filename - Filename to check
   * @returns {Promise<boolean>} True if file exists
   */
  async function fileExists(directoryHandle, filename) {
    if (!directoryHandle || !filename) return false;
    try {
      await directoryHandle.getFileHandle(filename);
      return true;
    } catch (error) {
      if (error && error.name === "NotFoundError") return false;
      throw error;
    }
  }

  /**
   * Check if a directory exists
   * @param {FileSystemDirectoryHandle} directoryHandle - Directory handle
   * @param {string} dirname - Directory name to check
   * @returns {Promise<boolean>} True if directory exists
   */
  async function directoryExists(directoryHandle, dirname) {
    if (!directoryHandle || !dirname) return false;
    try {
      await directoryHandle.getDirectoryHandle(dirname);
      return true;
    } catch (error) {
      if (error && error.name === "NotFoundError") return false;
      throw error;
    }
  }

  /**
   * Check if a file or directory exists (generic)
   * @param {FileSystemDirectoryHandle} directoryHandle - Directory handle
   * @param {string} name - Name to check
   * @param {string} kind - 'file' or 'directory'
   * @returns {Promise<boolean>} True if entry exists
   */
  async function handleExists(directoryHandle, name, kind) {
    if (!directoryHandle || !name) return false;
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

  /**
   * Split filename into base and extension
   * @param {string} filename - Filename to split
   * @returns {{base: string, extension: string}} Base name and extension
   */
  function splitFileName(filename) {
    const dotIndex = filename.lastIndexOf(".");
    if (dotIndex <= 0) return { base: filename, extension: "" };
    return {
      base: filename.slice(0, dotIndex),
      extension: filename.slice(dotIndex)
    };
  }

  /**
   * Generate a safe filename that doesn't conflict with existing files
   * @param {FileSystemDirectoryHandle} directoryHandle - Directory handle
   * @param {string} filename - Desired filename
   * @returns {Promise<string>} Safe filename (may be _copy_1, _copy_2, etc.)
   */
  async function getAvailableFileName(directoryHandle, filename) {
    if (!directoryHandle || !filename) return filename;
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

  /**
   * Generate a safe directory name that doesn't conflict with existing directories
   * @param {FileSystemDirectoryHandle} directoryHandle - Directory handle
   * @param {string} folderName - Desired folder name
   * @returns {Promise<string>} Safe folder name (may be _copy_1, _copy_2, etc.)
   */
  async function getAvailableDirectoryName(directoryHandle, folderName) {
    if (!directoryHandle || !folderName) return folderName;
    if (!(await directoryExists(directoryHandle, folderName))) return folderName;

    let counter = 1;
    let candidate = `${folderName}_copy_${counter}`;

    while (await directoryExists(directoryHandle, candidate)) {
      counter += 1;
      candidate = `${folderName}_copy_${counter}`;
    }

    return candidate;
  }

  return {
    fileExists,
    directoryExists,
    handleExists,
    splitFileName,
    getAvailableFileName,
    getAvailableDirectoryName
  };
})();
