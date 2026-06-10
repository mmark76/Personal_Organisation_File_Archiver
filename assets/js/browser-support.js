/* Browser capability checks. */

window.BrowserSupport = (() => {
  function supportsDirectoryPicker() {
    return typeof window.showDirectoryPicker === "function";
  }

  function supportsFilePicker() {
    return typeof window.showOpenFilePicker === "function";
  }

  function getDirectoryPickerMessage() {
    return supportsDirectoryPicker()
      ? "Direct folder access is available in this browser."
      : window.AppMessages.folderCreationUnsupported;
  }

  return {
    supportsDirectoryPicker,
    supportsFilePicker,
    getDirectoryPickerMessage
  };
})();
