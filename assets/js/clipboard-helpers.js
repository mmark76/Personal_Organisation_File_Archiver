async function writeTextToClipboard(text, successMessage) {
  try {
    if (!navigator.clipboard || !navigator.clipboard.writeText) {
      throw new Error("Clipboard API is not available in this browser.");
    }

    await navigator.clipboard.writeText(text);

    if (successMessage) {
      alert(successMessage);
    }
  } catch (error) {
    alert("Copy failed. Please select the text manually and copy it.");
  }
}

function copyFileAdvice() {
  const output = document.getElementById("fileDestinationOutput");
  const text = output ? output.textContent : "";
  writeTextToClipboard(text, "File destination advice copied.");
}

function copyTreeOutput() {
  const output = document.getElementById("treeOutput");
  const text = output ? output.textContent : "";
  writeTextToClipboard(text, "Folder structure copied.");
}
