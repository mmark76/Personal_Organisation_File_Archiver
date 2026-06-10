/* Visual folder numbering codes. These codes are display-only. */

window.FolderTreeCodes = (() => {
  function padPart(value, width = 3) {
    return String(value).padStart(width, "0");
  }

  function getMainFolderCode(node, fallbackIndex) {
    const match = String(node.name || "").match(/^(\d{2})/);
    return match ? match[1] : padPart(fallbackIndex + 1, 2);
  }

  function getDisplayCodeFromIndexPath(indexPath, node) {
    if (!indexPath.length) return "";

    const codeParts = [getMainFolderCode(node, indexPath[0])];

    for (let index = 1; index < indexPath.length; index += 1) {
      codeParts.push(padPart(indexPath[index] + 1));
    }

    return codeParts.join(".");
  }

  return {
    getDisplayCodeFromIndexPath
  };
})();
