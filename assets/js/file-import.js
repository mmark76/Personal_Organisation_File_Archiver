/* File import and status display. */

window.FileImport = (() => {
  const { setLoadedFile } = window.AppState;
  const { formatBytes, escapeHtml, setHtml } = window.AppUtils;

  function renderFileStatus() {
    const file = window.AppState.state.loadedFile;

    if (!file) {
      setHtml("#fileStatusBox", window.AppMessages.noFileLoaded);
      window.FileAdvisor?.renderSuggestion();
      return;
    }

    const modified = file.lastModified ? new Date(file.lastModified).toLocaleString() : "Unknown";
    const type = file.type || "Unknown type";

    setHtml(
      "#fileStatusBox",
      `<strong>${escapeHtml(file.name)}</strong><br>` +
      `Type: ${escapeHtml(type)}<br>` +
      `Size: ${formatBytes(file.size)}<br>` +
      `Last modified: ${escapeHtml(modified)}`
    );

    window.FileAdvisor?.renderSuggestion();
  }

  function openFileInput() {
    const input = document.getElementById("archiveFileInput");
    if (input) input.click();
  }

  function handleFileInput(input) {
    const file = input.files && input.files[0];
    if (!file) return;

    setLoadedFile(file);
    renderFileStatus();
    window.AppUtils.setText("#archiveResultBox", window.AppMessages.fileLoaded);
    input.value = "";
  }

  return {
    openFileInput,
    handleFileInput,
    renderFileStatus
  };
})();