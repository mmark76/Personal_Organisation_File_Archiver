function importExampleCvFile() {
  if (tree.children.every(mainCategory => mainCategory.children.length === 0)) {
    loadMarkellosExample();
  }

  importedFileData = {
    name: "CV.pdf",
    type: "application/pdf",
    size: 0,
    lastModified: new Date().toISOString().slice(0, 10),
    text: ""
  };

  const fileNameInput = document.getElementById("destinationFileName");
  if (fileNameInput) {
    fileNameInput.value = importedFileData.name;
  }

  const reasonInput = document.getElementById("destinationReason");
  if (reasonInput && !reasonInput.value.trim()) {
    reasonInput.value = "Example: This file is a CV and should be archived under the profile CV folder.";
  }

  updateFileAnalysisBox();
  analyzeCurrentFileData();

  const suggestion = suggestBestFolder(buildAnalysisText(importedFileData.name));
  if (suggestion) {
    selectDestinationNode(suggestion.nodeId);
    previewFileDestination();
  }
}
