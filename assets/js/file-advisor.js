/* Simple offline folder advisor based on filename, metadata, extension, and folder-tree matching. */

window.FileAdvisor = (() => {
  const imageExtensions = ["jpg", "jpeg", "png", "gif", "webp", "svg", "heic"];
  const videoExtensions = ["mp4", "mov", "avi", "mkv", "webm"];
  const documentExtensions = ["pdf", "doc", "docx", "odt", "rtf", "txt", "md"];
  const spreadsheetExtensions = ["xls", "xlsx", "csv", "ods"];
  const presentationExtensions = ["ppt", "pptx", "odp"];
  const archiveExtensions = ["zip", "rar", "7z", "tar", "gz"];

  const keywordGroups = [
    { terms: ["cv", "resume", "bio", "profile", "βιογραφικο"], targets: ["CVS", "PROFILE"], reason: "filename suggests a CV or profile document" },
    { terms: ["degree", "diploma", "certificate", "certification", "πτυχιο", "διπλωμα", "πιστοποιητικο"], targets: ["DEGREES", "CERTIFICATES", "PROFILE"], reason: "filename suggests a degree or certificate" },
    { terms: ["reference", "recommendation", "συσταση"], targets: ["REFERENCES", "PROFILE"], reason: "filename suggests a reference document" },
    { terms: ["invoice", "receipt", "bill", "payment", "tax", "vat", "bank", "statement", "financial", "αποδειξη", "τιμολογιο", "πληρωμη", "φορος", "τραπεζα"], targets: ["FINANCIAL", "RECEIPTS", "INVOICES", "TAX"], reason: "filename suggests a financial document" },
    { terms: ["contract", "agreement", "lease", "policy", "insurance", "συμβαση", "συμβολαιο", "ασφαλεια"], targets: ["CONTRACTS", "LEGAL", "FINANCIAL", "PROFESSIONAL"], reason: "filename suggests a contract or formal agreement" },
    { terms: ["health", "medical", "doctor", "hospital", "clinic", "blood", "xray", "scan", "υγεια", "ιατρικο", "γιατρος", "νοσοκομειο", "κλινικη", "αιμα"], targets: ["HEALTH", "MEDICAL", "PERSONAL"], reason: "filename suggests a health document" },
    { terms: ["family", "birth", "marriage", "child", "children", "school", "οικογενεια", "γεννηση", "γαμος", "παιδι", "παιδια", "σχολειο"], targets: ["FAMILY", "PERSONAL"], reason: "filename suggests a family document" },
    { terms: ["chess", "pgn", "tournament", "game", "σκακι", "τουρνουα", "παρτιδα"], targets: ["CHESS", "INTERESTS", "PERSONAL"], reason: "filename suggests a chess or interest-related file" },
    { terms: ["swim", "swimming", "κολυμπι", "κολυμβηση"], targets: ["SWIMMING", "INTERESTS", "PERSONAL"], reason: "filename suggests an interest-related file" },
    { terms: ["blog", "article", "post", "writing", "αρθρο", "κειμενο", "γραφη"], targets: ["BLOG_WRITING", "INTERESTS", "PERSONAL"], reason: "filename suggests blog or writing material" },
    { terms: ["project", "report", "meeting", "minutes", "work", "office", "ministry", "marina", "professional", "εργο", "αναφορα", "συναντηση", "πρακτικα", "εργασια", "γραφειο", "υπουργειο", "μαρινα"], targets: ["PROFESSIONAL", "PROJECTS", "WORK"], reason: "filename suggests a professional or work file" },
    { terms: ["photo", "image", "picture", "pic", "φωτο", "φωτογραφια", "εικονα"], targets: ["PHOTOS", "IMAGES", "FAMILY", "PERSONAL"], reason: "filename suggests an image or photo" },
    { terms: ["video", "movie", "clip", "βιντεο", "ταινια"], targets: ["VIDEOS", "FAMILY", "PERSONAL"], reason: "filename suggests a video" }
  ];

  function getExtension(filename) {
    const match = String(filename || "").toLowerCase().match(/\.([a-z0-9]+)$/);
    return match ? match[1] : "";
  }

  function getBaseName(filename) {
    return String(filename || "").replace(/\.[^.]+$/, "");
  }

  function normalizeText(value) {
    return String(value || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toUpperCase();
  }

  function tokenize(value) {
    return normalizeText(value)
      .split(/[^\p{L}0-9]+/u)
      .filter(token => token.length >= 2);
  }

  function getYearCandidates(file) {
    const years = new Set();
    const filenameYears = String(file?.name || "").match(/(?:19|20)\d{2}/g) || [];
    filenameYears.forEach(year => years.add(year));

    if (file?.lastModified) {
      years.add(String(new Date(file.lastModified).getFullYear()));
    }

    return Array.from(years);
  }

  function collectFolderCandidates() {
    const candidates = [];

    function walk(node) {
      if (!node || node.id === "documents") {
        (node?.children || []).forEach(walk);
        return;
      }

      const path = window.FolderTree.getFolderPath(node.id);
      const pathTokens = tokenize(path);

      candidates.push({
        node,
        path,
        pathTokens,
        score: 0,
        reasons: []
      });

      (node.children || []).forEach(walk);
    }

    walk(window.AppState.state.tree);
    return candidates;
  }

  function addScore(candidate, points, reason) {
    candidate.score += points;
    if (reason && !candidate.reasons.includes(reason)) candidate.reasons.push(reason);
  }

  function scoreFilenameTokens(candidate, filenameTokens) {
    filenameTokens.forEach(token => {
      if (candidate.pathTokens.includes(token)) {
        addScore(candidate, 4, `filename contains "${token.toLowerCase()}" which matches the folder tree`);
        return;
      }

      if (candidate.pathTokens.some(pathToken => pathToken.includes(token) || token.includes(pathToken))) {
        addScore(candidate, 2, `filename partially matches the folder tree through "${token.toLowerCase()}"`);
      }
    });
  }

  function scoreKeywordGroups(candidate, filenameTokens) {
    keywordGroups.forEach(group => {
      const matchedTerm = group.terms.find(term => filenameTokens.includes(normalizeText(term)));
      if (!matchedTerm) return;

      const targetMatched = group.targets.some(target => candidate.pathTokens.includes(normalizeText(target)));
      if (targetMatched) addScore(candidate, 5, group.reason);
    });
  }

  function scoreExtension(candidate, extension) {
    if (!extension) return;

    if (imageExtensions.includes(extension)) {
      if (candidate.pathTokens.some(token => ["PHOTO", "PHOTOS", "IMAGE", "IMAGES", "FAMILY", "PERSONAL"].includes(token))) {
        addScore(candidate, 2, `extension .${extension} suggests an image file`);
      }
      return;
    }

    if (videoExtensions.includes(extension)) {
      if (candidate.pathTokens.some(token => ["VIDEO", "VIDEOS", "FAMILY", "PERSONAL"].includes(token))) {
        addScore(candidate, 2, `extension .${extension} suggests a video file`);
      }
      return;
    }

    if (spreadsheetExtensions.includes(extension)) {
      if (candidate.pathTokens.some(token => ["FINANCIAL", "BUDGET", "TAX", "PROFESSIONAL", "PROJECTS"].includes(token))) {
        addScore(candidate, 1, `extension .${extension} suggests a spreadsheet or table`);
      }
      return;
    }

    if (documentExtensions.includes(extension)) {
      if (candidate.pathTokens.some(token => ["PROFILE", "FINANCIAL", "HEALTH", "FAMILY", "PROFESSIONAL"].includes(token))) {
        addScore(candidate, 1, `extension .${extension} suggests a document`);
      }
      return;
    }

    if (presentationExtensions.includes(extension)) {
      if (candidate.pathTokens.some(token => ["PROFESSIONAL", "PROJECTS", "WORK"].includes(token))) {
        addScore(candidate, 1, `extension .${extension} suggests a presentation`);
      }
      return;
    }

    if (archiveExtensions.includes(extension)) {
      if (candidate.pathTokens.some(token => ["BACKUP", "PROJECTS", "PROFESSIONAL"].includes(token))) {
        addScore(candidate, 1, `extension .${extension} suggests a bundled archive file`);
      }
    }
  }

  function scoreYears(candidate, years) {
    years.forEach(year => {
      if (candidate.path.includes(year)) {
        addScore(candidate, 2, `file date or filename includes ${year}, which matches the folder path`);
      }
    });
  }

  function getConfidence(score) {
    if (score >= 9) return "High";
    if (score >= 5) return "Medium";
    if (score >= 2) return "Low";
    return "Unsure";
  }

  function suggestForFile(file) {
    if (!file) return null;

    const filenameTokens = tokenize(getBaseName(file.name));
    const extension = getExtension(file.name);
    const years = getYearCandidates(file);
    const candidates = collectFolderCandidates();

    candidates.forEach(candidate => {
      scoreFilenameTokens(candidate, filenameTokens);
      scoreKeywordGroups(candidate, filenameTokens);
      scoreExtension(candidate, extension);
      scoreYears(candidate, years);
    });

    candidates.sort((a, b) => b.score - a.score || a.path.length - b.path.length);
    const best = candidates[0];

    if (!best || best.score <= 0) {
      return {
        nodeId: null,
        path: "UNSURE",
        confidence: "Unsure",
        reason: "No strong filename, metadata, extension, or folder-tree match was found."
      };
    }

    return {
      nodeId: best.node.id,
      path: best.path,
      confidence: getConfidence(best.score),
      reason: best.reasons[0] || "Best match found from filename, metadata, extension, and folder-tree comparison."
    };
  }

  function renderSuggestion() {
    const box = document.getElementById("advisorSuggestionBox");
    if (!box) return;

    const file = window.AppState.state.loadedFile;
    if (!file) {
      box.innerHTML = "No file loaded yet.";
      return;
    }

    const suggestion = suggestForFile(file);
    if (!suggestion || !suggestion.nodeId) {
      box.innerHTML =
        `<strong>Suggested destination:</strong> UNSURE<br>` +
        `<strong>Confidence:</strong> Unsure<br>` +
        `<strong>Reason:</strong> No strong filename, metadata, extension, or folder-tree match was found.`;
      return;
    }

    box.innerHTML =
      `<strong>Suggested destination:</strong> ${window.AppUtils.escapeHtml(suggestion.path)}<br>` +
      `<strong>Confidence:</strong> ${window.AppUtils.escapeHtml(suggestion.confidence)}<br>` +
      `<strong>Reason:</strong> ${window.AppUtils.escapeHtml(suggestion.reason)}<br>` +
      `<button type="button" class="button button-secondary advisor-use-button" data-advisor-node-id="${window.AppUtils.escapeHtml(suggestion.nodeId)}">Use suggested destination</button>`;
  }

  function bindEvents() {
    const box = document.getElementById("advisorSuggestionBox");
    if (!box || box.dataset.advisorBound === "true") return;

    box.dataset.advisorBound = "true";
    box.addEventListener("click", event => {
      const button = event.target.closest("button[data-advisor-node-id]");
      if (!button) return;
      window.FolderTree.selectArchiveFolder(button.dataset.advisorNodeId);
      renderSuggestion();
    });
  }

  return {
    suggestForFile,
    renderSuggestion,
    bindEvents
  };
})();
