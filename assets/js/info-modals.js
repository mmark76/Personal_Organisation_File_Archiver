function openInfoModal(modalId) {
  const modal = document.getElementById(modalId);
  if (!modal) return;
  modal.classList.remove("hidden");
}

function closeInfoModal(modalId) {
  const modal = document.getElementById(modalId);
  if (!modal) return;
  modal.classList.add("hidden");
}

function formatSimpleFileSize(size) {
  if (!Number.isFinite(size)) return "Unknown size";
  if (size < 1024) return size + " B";
  if (size < 1024 * 1024) return Math.round(size / 1024) + " KB";
  return (size / (1024 * 1024)).toFixed(1) + " MB";
}

function injectSimpleFileLoaderStyles() {
  if (document.getElementById("simpleFileLoaderStyles")) return;

  const style = document.createElement("style");
  style.id = "simpleFileLoaderStyles";
  style.textContent = `
    .simple-file-loader-panel {
      display: grid;
      gap: 12px;
    }

    .simple-file-loader-panel.hidden {
      display: none !important;
    }

    .simple-file-loader-card {
      display: grid;
      gap: 10px;
      align-items: start;
      background: var(--ui-surface-soft, #f9fafb);
      border: 1px solid var(--ui-border-soft, #e5e7eb);
      border-radius: var(--ui-radius-sm, 6px);
      padding: 12px;
    }

    .simple-file-loader-status {
      white-space: pre-wrap;
      color: var(--ui-muted, #6b7280);
      font-size: 12.5px;
      line-height: 1.45;
    }

    body.theme-dark .simple-file-loader-card {
      background: #0a0a0a;
      border-color: #262626;
    }

    body.theme-dark .simple-file-loader-status {
      color: #d4d4d4;
    }
  `;
  document.head.appendChild(style);
}

function injectAppEntryStyles() {
  if (document.getElementById("appEntryStyles")) return;

  const style = document.createElement("style");
  style.id = "appEntryStyles";
  style.textContent = `
    .app-entry-screen {
      width: min(760px, calc(100% - 40px));
      margin: 28px auto 34px;
      display: grid;
      gap: 16px;
      justify-items: center;
    }

    .app-entry-screen.hidden {
      display: none !important;
    }

    .app-entry-heading {
      display: grid;
      gap: 6px;
      text-align: center;
      width: 100%;
    }

    .app-entry-heading h2 {
      margin: 0;
      font-size: 22px;
      line-height: 1.25;
      font-weight: 650;
      color: var(--ui-text, #111827);
    }

    .app-entry-heading p {
      margin: 0;
      color: var(--ui-muted, #6b7280);
      font-size: 13px;
      line-height: 1.45;
    }

    .app-entry-options {
      display: grid;
      grid-template-columns: repeat(2, minmax(230px, 1fr));
      gap: 14px;
      width: 100%;
      justify-content: center;
      align-items: stretch;
    }

    .app-entry-card {
      display: grid;
      align-content: center;
      justify-items: center;
      gap: 8px;
      text-align: center;
      background: #ffffff !important;
      color: var(--ui-text, #111827) !important;
      border: 1px solid var(--ui-border-soft, #e5e7eb) !important;
      border-radius: 12px !important;
      padding: 18px 20px !important;
      box-shadow: 0 10px 26px rgba(15, 23, 42, 0.06) !important;
      min-height: 108px;
      width: 100% !important;
    }

    .app-entry-card:hover {
      background: #f9fafb !important;
      border-color: var(--ui-border, #d9dee7) !important;
    }

    .app-entry-card strong {
      font-size: 16px;
      line-height: 1.25;
      font-weight: 700;
      text-align: center;
    }

    .app-entry-card span {
      color: var(--ui-muted, #6b7280);
      font-size: 12.5px;
      line-height: 1.45;
      font-weight: 400;
      text-align: center;
    }

    body.theme-dark .app-entry-heading h2,
    body.theme-dark .app-entry-card strong {
      color: #ffffff !important;
    }

    body.theme-dark .app-entry-heading p,
    body.theme-dark .app-entry-card span {
      color: #d4d4d4 !important;
    }

    body.theme-dark .app-entry-card {
      background: #0a0a0a !important;
      border-color: #262626 !important;
      box-shadow: none !important;
    }

    body.theme-dark .app-entry-card:hover {
      background: #111111 !important;
      border-color: #404040 !important;
    }

    @media (max-width: 720px) {
      .app-entry-screen {
        width: min(100% - 24px, 760px);
      }

      .app-entry-options {
        grid-template-columns: 1fr;
      }

      .app-entry-card {
        min-height: 96px;
      }
    }
  `;
  document.head.appendChild(style);
}

async function handleSimpleImportedFile(file, statusBox) {
  if (!file) return;

  importedFileData = {
    name: file.name,
    type: file.type || "unknown",
    size: file.size,
    lastModified: new Date(file.lastModified).toISOString().slice(0, 10),
    text: "",
    file
  };

  if (typeof isTextReadableFile === "function" && isTextReadableFile(file)) {
    try {
      importedFileData.text = (await file.text()).slice(0, 12000);
    } catch (error) {
      importedFileData.text = "";
    }
  }

  if (statusBox) {
    statusBox.textContent = [
      "Selected file:",
      importedFileData.name,
      "",
      "Type: " + importedFileData.type,
      "Size: " + formatSimpleFileSize(importedFileData.size),
      "Modified: " + importedFileData.lastModified
    ].join("\n");
  }
}

async function openSimpleFilePicker(input, statusBox) {
  if (window.showOpenFilePicker && window.organizeYourPcRootDirectoryHandle) {
    try {
      const [fileHandle] = await window.showOpenFilePicker({
        startIn: window.organizeYourPcRootDirectoryHandle,
        multiple: false
      });
      const file = await fileHandle.getFile();
      await handleSimpleImportedFile(file, statusBox);
      return;
    } catch (error) {
      if (error && error.name === "AbortError") return;
    }
  }

  input.click();
}

function setupSimpleFileLoaderPanel() {
  const destinationPanel = document.querySelector(".destination-panel");
  if (!destinationPanel || document.getElementById("simpleFileLoaderPanel")) return;

  injectSimpleFileLoaderStyles();

  destinationPanel.innerHTML = "";
  destinationPanel.classList.add("simple-file-loader-panel");

  const title = document.createElement("h2");
  title.textContent = "File Import";

  const description = document.createElement("p");
  description.textContent = "Load a file through the native Windows file picker.";

  const card = document.createElement("div");
  card.id = "simpleFileLoaderPanel";
  card.className = "simple-file-loader-card";

  const input = document.createElement("input");
  input.type = "file";
  input.id = "simpleImportedFileInput";
  input.className = "hidden";

  const button = document.createElement("button");
  button.type = "button";
  button.textContent = "Import / Load File";

  const status = document.createElement("div");
  status.className = "simple-file-loader-status";
  status.textContent = "No file selected.";

  button.addEventListener("click", () => openSimpleFilePicker(input, status));

  input.addEventListener("change", event => {
    const file = event.target.files && event.target.files[0] ? event.target.files[0] : null;
    handleSimpleImportedFile(file, status);
  });

  card.appendChild(button);
  card.appendChild(input);
  card.appendChild(status);

  destinationPanel.appendChild(title);
  destinationPanel.appendChild(description);
  destinationPanel.appendChild(card);
}

function setAppMode(mode) {
  const entryScreen = document.getElementById("appEntryScreen");
  const appShell = document.querySelector(".app-shell");
  const treePanel = document.querySelector(".tree-panel");
  const destinationPanel = document.querySelector(".destination-panel");
  const backButton = document.getElementById("appModeBackButton");
  const brandHero = document.querySelector(".brand-hero");
  const appExplanation = document.querySelector(".app-explanation");

  if (!appShell || !treePanel || !destinationPanel) return;

  const showEntry = !mode;
  if (entryScreen) entryScreen.classList.toggle("hidden", !showEntry);
  appShell.classList.toggle("hidden", showEntry);
  if (backButton) backButton.classList.toggle("hidden", showEntry);
  if (brandHero) brandHero.classList.toggle("hidden", !showEntry);
  if (appExplanation) appExplanation.classList.toggle("hidden", !showEntry);

  if (showEntry) {
    treePanel.classList.remove("hidden");
    destinationPanel.classList.remove("hidden");
    return;
  }

  treePanel.classList.toggle("hidden", mode !== "tree");
  destinationPanel.classList.toggle("hidden", mode !== "archive");
}

function setupAppEntryScreen() {
  const appShell = document.querySelector(".app-shell");
  if (!appShell || document.getElementById("appEntryScreen")) return;

  injectAppEntryStyles();

  const entryScreen = document.createElement("section");
  entryScreen.id = "appEntryScreen";
  entryScreen.className = "app-entry-screen";
  entryScreen.setAttribute("aria-label", "Main app choices");

  entryScreen.innerHTML = `
    <div class="app-entry-heading">
      <h2>Choose what you want to do</h2>
      <p>Start with the folder structure, or load a file for archiving.</p>
    </div>
    <div class="app-entry-options">
      <button type="button" class="app-entry-card" id="buildTreeOption">
        <strong>Build Folder Tree</strong>
        <span>Create, export, import, or generate your folder structure on this PC.</span>
      </button>
      <button type="button" class="app-entry-card" id="archiveFileOption">
        <strong>Archive File</strong>
        <span>Load a file through the native Windows file picker.</span>
      </button>
    </div>
  `;

  const headerActions = document.querySelector(".header-actions");
  if (headerActions && !document.getElementById("appModeBackButton")) {
    const backButton = document.createElement("button");
    backButton.type = "button";
    backButton.id = "appModeBackButton";
    backButton.className = "secondary hidden";
    backButton.textContent = "Back to main choices";
    backButton.addEventListener("click", () => setAppMode(""));
    headerActions.insertBefore(backButton, headerActions.firstChild);
  }

  appShell.parentNode.insertBefore(entryScreen, appShell);

  document.getElementById("buildTreeOption").addEventListener("click", () => setAppMode("tree"));
  document.getElementById("archiveFileOption").addEventListener("click", () => setAppMode("archive"));

  setAppMode("");
}

document.addEventListener("keydown", event => {
  if (event.key !== "Escape") return;
  document.querySelectorAll(".modal:not(.hidden)").forEach(modal => {
    if (modal.id === "importantDisclaimerModal" || modal.id === "howThisAppWorksModal") {
      modal.classList.add("hidden");
    }
  });
});

document.addEventListener("DOMContentLoaded", () => {
  setupSimpleFileLoaderPanel();
  setupAppEntryScreen();
});