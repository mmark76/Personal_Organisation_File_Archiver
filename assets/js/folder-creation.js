const appRootFolderName = "Organize Your PC";

window.createFoldersOnComputer = async function createFoldersOnComputer() {
  if (!window.showDirectoryPicker) {
    alert("Direct folder creation is not available in this browser. The advisory features still work. Use a browser that supports direct folder access, such as Chrome or Edge, to create folders from the app.");
    return;
  }

  try {
    const selectedRootHandle = await window.showDirectoryPicker();
    const appRootHandle = await selectedRootHandle.getDirectoryHandle(appRootFolderName, { create: true });
    window.organizeYourPcRootDirectoryHandle = appRootHandle;

    for (const folderPath of latestFolderPaths) {
      const parts = folderPath.split("\\").filter(Boolean);
      let currentHandle = appRootHandle;
      for (const part of parts) {
        currentHandle = await currentHandle.getDirectoryHandle(part, { create: true });
      }
    }

    alert("Folder structure created successfully inside: " + appRootFolderName);
  } catch (error) {
    alert("Folder creation was cancelled or failed.");
  }
};