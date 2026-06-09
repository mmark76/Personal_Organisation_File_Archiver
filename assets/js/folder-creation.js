window.downloadWindowsBatch = undefined;

window.createFoldersOnComputer = async function createFoldersOnComputer() {
  if (!window.showDirectoryPicker) {
    alert("This browser does not support direct folder creation. Use Chrome or Edge.");
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
