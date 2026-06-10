/* Visual folder numbering codes. These codes are display-only. */

window.FolderTreeCodes = (() => {
  function padPart(value, width = 3) {
    return String(value).padStart(width, "0");
  }

  function getMainFolderCode(indexPath) {
    return padPart(indexPath[0] + 1, 2);
  }

  function getDisplayCodeFromIndexPath(indexPath) {
    if (!indexPath.length) return "";

    const codeParts = [getMainFolderCode(indexPath)];

    for (let index = 1; index < indexPath.length; index += 1) {
      codeParts.push(padPart(indexPath[index] + 1));
    }

    return codeParts.join(".");
  }

  return {
    getDisplayCodeFromIndexPath
  };
})();
