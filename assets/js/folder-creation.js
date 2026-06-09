window.createFoldersOnComputer = async function createFoldersOnComputer() {
  if (!window.showDirectoryPicker) {
    alert("Direct folder creation is not available in this browser. The advisory features still work. Use a browser that supports direct folder access, such as Chrome or Edge, to create folders from the app.");
    return;
  }

  try {
    const rootHandle = await window.showDirectoryPicker();
    for (const folderPath of latestFolderPaths) {
      const parts = folderPath.split("\\").filter(Boolean);
      let currentHandle = rootHandle;
      for (const part of parts) {
        currentHandle = await currentHandle.getDirectoryHandle(part, { create: true });
      }
    }
    alert("Folder structure created successfully.");
  } catch (error) {
    alert("Folder creation was cancelled or failed.");
  }
};
