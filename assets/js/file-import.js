/* File import and status display. */

window.FileImport = (() => {
  const { setLoadedFile } = window.AppState;
  const { formatBytes } = window.AppUtils;

  function appendStatusLine(container, text) {
    container.append(document.createTextNode(text), document.createElement("br"));
  }

  function renderFileStatus() {
    const file = window.AppState.state.loadedFile;
    const box = document.getElementById("fileStatusBox");

    if (!file) {
      if (box) box.textContent = window.AppMessages.noFileLoaded;
      window.FileAdvisor?.renderSuggestion();
      return;
    }

    if (box) {
      const modified = file.lastModified ? new Date(file.lastModified).toLocaleString() : "Unknown";
      const type = file.type || "Unknown type";
      const fileName = document.createElement("strong");

      fileName.textContent = file.name;
      box.replaceChildren(fileName, document.createElement("br"));
      appendStatusLine(box, `Type: ${type}`);
      appendStatusLine(box, `Size: ${formatBytes(file.size)}`);
      box.append(document.createTextNode(`Last modified: ${modified}`));
    }

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