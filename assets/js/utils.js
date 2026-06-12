/* Shared utility helpers. */

window.AppUtils = (() => {
  function qs(selector, root = document) {
    return root.querySelector(selector);
  }

  function qsa(selector, root = document) {
    return Array.from(root.querySelectorAll(selector));
  }

  function normalizeText(value) {
    return String(value || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim();
  }

  function getWindowsReservedNameStem(value) {
    return String(value || "")
      .trim()
      .split(".")[0]
      .toUpperCase();
  }

  function isWindowsReservedFolderName(value) {
    const stem = getWindowsReservedNameStem(value);
    if (!stem) return false;

    return ["CON", "PRN", "AUX", "NUL"].includes(stem) ||
      /^COM[1-9]$/.test(stem) ||
      /^LPT[1-9]$/.test(stem);
  }

  function sanitizeFolderName(value) {
    const name = String(value || "")
      .trim()
      .replace(/[<>:"/\\|?*]+/g, " ")
      .replace(/\s+/g, "_")
      .replace(/^_+|_+$/g, "")
      .toUpperCase();

    return isWindowsReservedFolderName(name) ? "" : name;
  }

  function formatBytes(bytes) {
    if (!Number.isFinite(bytes) || bytes <= 0) return "0 B";
    const units = ["B", "KB", "MB", "GB"];
    let value = bytes;
    let unitIndex = 0;

    while (value >= 1024 && unitIndex < units.length - 1) {
      value /= 1024;
      unitIndex += 1;
    }

    return `${value.toFixed(value >= 10 || unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
  }

  function downloadTextFile(filename, content, type = "text/plain;charset=utf-8") {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  async function writeClipboard(text) {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }

    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.left = "-9999px";
    document.body.appendChild(textarea);
    textarea.select();
    const success = document.execCommand("copy");
    textarea.remove();
    return success;
  }

  function setText(selector, text) {
    const element = qs(selector);
    if (element) element.textContent = text;
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  return {
    qs,
    qsa,
    normalizeText,
    getWindowsReservedNameStem,
    isWindowsReservedFolderName,
    sanitizeFolderName,
    formatBytes,
    downloadTextFile,
    writeClipboard,
    setText,
    escapeHtml
  };
})();