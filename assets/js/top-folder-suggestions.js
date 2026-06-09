function calculateFolderSuggestionScore(candidate, analysisText) {
  const normalizedPath = normalizeText(candidate.path);
  const keywords = buildCandidateKeywords(candidate);
  const matches = keywords.filter(keyword => analysisText.includes(keyword));
  let score = matches.length;

  if (candidate.node.children.length === 0) score += 0.75;
  if (normalizedPath.includes("01_profile")) score += score > 0 ? 1 : 0;
  if (normalizedPath.includes("cvs") && /cv|resume|curriculum|vitae|βιογραφικο|βιογραφικα|biografiko/.test(analysisText)) score += 3;
  if (normalizedPath.includes("degrees") && /degree|diploma|bachelor|master|mba|university|πτυχιο|πτυχια|ptychio|ptychia/.test(analysisText)) score += 3;
  if (normalizedPath.includes("certificates") && /certificate|certification|license|licence|training|πιστοποιητικο|πιστοποιητικα|pistopoiitiko/.test(analysisText)) score += 3;
  if (normalizedPath.includes("references") && /reference|recommendation|referee|συστατικη|συστατικες|systatiki|systatikes/.test(analysisText)) score += 3;
  if (normalizedPath.includes("supporting_evidence") && /proof|evidence|verification|confirmation|supporting|αποδεικτικο|αποδεικτικα|apodeiktiko/.test(analysisText)) score += 3;
  if (normalizedPath.includes("chess") && /chess|tournament|opening|game|pgn|σκακι|skaki/.test(analysisText)) score += 3;
  if (normalizedPath.includes("swimming") && /swimming|swim|pool|sea|κολυμπι|kolympi/.test(analysisText)) score += 3;
  if (normalizedPath.includes("mnemonic") && /mnemonic|memory|loci|μνημονικες|mnimonikes/.test(analysisText)) score += 3;
  if (normalizedPath.includes("blog") && /blog|article|writing|post|blogger|αρθρο|arthro/.test(analysisText)) score += 3;
  if (normalizedPath.includes("web_apps") && /web app|javascript|html|css|github|cursor/.test(analysisText)) score += 3;
  if (normalizedPath.includes("financial") && /invoice|receipt|bank|tax|payment|financial/.test(analysisText)) score += 2;
  if (normalizedPath.includes("health") && /health|medical|doctor|hospital|clinic|blood/.test(analysisText)) score += 2;
  if (normalizedPath.includes("professional") && /work|project|ministry|meci|report|meeting|professional/.test(analysisText)) score += 1.5;

  return {
    ...candidate,
    score,
    matches: matches.slice(0, 8),
    confidence: score >= 5 ? "high" : score >= 3 ? "medium" : "low"
  };
}

function suggestBestFolders(analysisText, limit = 3) {
  if (!analysisText.trim()) return [];

  return getDestinationCandidates()
    .map(candidate => calculateFolderSuggestionScore(candidate, analysisText))
    .filter(candidate => candidate.score > 0)
    .sort((first, second) => {
      if (second.score !== first.score) return second.score - first.score;
      if (first.node.children.length !== second.node.children.length) return first.node.children.length - second.node.children.length;
      return first.path.localeCompare(second.path);
    })
    .slice(0, limit)
    .map(candidate => ({
      nodeId: candidate.node.id,
      path: candidate.path,
      confidence: candidate.confidence,
      score: candidate.score,
      matches: candidate.matches.length ? candidate.matches : ["contextual pattern"]
    }));
}

function suggestBestFolder(analysisText) {
  return suggestBestFolders(analysisText, 1)[0] || null;
}

function analyzeCurrentFileData() {
  const suggestionBox = byId("autoSuggestionBox");
  if (!suggestionBox) return;

  const fileName = byId("destinationFileName").value.trim();
  const analysisText = buildAnalysisText(fileName);
  const suggestions = suggestBestFolders(analysisText, 3);

  if (!suggestions.length) {
    suggestionBox.classList.add("hidden");
    suggestionBox.textContent = "";
    return;
  }

  renderSuggestionBox(suggestionBox, suggestions);
}

function renderSuggestionBox(suggestionBox, suggestions) {
  const normalizedSuggestions = Array.isArray(suggestions) ? suggestions : [suggestions];

  suggestionBox.classList.remove("hidden");
  suggestionBox.innerHTML = "";
  suggestionBox.classList.add("top-folder-suggestions");

  suggestionBox.appendChild(createTextElement("strong", "", "Recommended folders"));
  suggestionBox.appendChild(createTextElement("div", "suggestion-note", "Choose one destination only. The app will not file the same document in multiple folders."));

  normalizedSuggestions.forEach((suggestion, index) => {
    const card = createTextElement("div", "folder-suggestion-card");
    const title = createTextElement("div", "folder-suggestion-title", `${index + 1}. ${suggestion.path}`);
    const meta = createTextElement("div", "folder-suggestion-meta", `Confidence: ${suggestion.confidence} · matched: ${suggestion.matches.join(", ")}`);
    const button = createButton("Select this folder", () => selectSuggestedDestination(suggestion.nodeId), "folder-suggestion-button");

    card.appendChild(title);
    card.appendChild(meta);
    card.appendChild(button);
    suggestionBox.appendChild(card);
  });
}

function selectSuggestedDestination(nodeId) {
  destinationCurrentNodeId = nodeId;
  updateDestinationGuide();
  renderTree();
  chooseCurrentAsFinal();
}

function injectTopFolderSuggestionStyles() {
  if (document.getElementById("topFolderSuggestionStyles")) return;

  const style = document.createElement("style");
  style.id = "topFolderSuggestionStyles";
  style.textContent = `
    .top-folder-suggestions {
      gap: 10px;
    }

    .suggestion-note {
      font-size: 12px;
      color: #065f46;
    }

    .folder-suggestion-card {
      display: grid;
      gap: 7px;
      padding: 10px;
      border: 1px solid rgba(6, 95, 70, 0.2);
      border-radius: 10px;
      background: rgba(255, 255, 255, 0.72);
    }

    .folder-suggestion-title {
      font-weight: 700;
      word-break: break-word;
    }

    .folder-suggestion-meta {
      font-size: 12px;
      color: #065f46;
      word-break: break-word;
    }

    .folder-suggestion-button {
      justify-self: start;
    }

    body.theme-dark .folder-suggestion-card {
      background: #020617;
      border-color: rgba(134, 239, 172, 0.35);
    }

    body.theme-dark .suggestion-note,
    body.theme-dark .folder-suggestion-meta {
      color: #bbf7d0;
    }
  `;
  document.head.appendChild(style);
}

window.suggestBestFolders = suggestBestFolders;
window.suggestBestFolder = suggestBestFolder;
window.analyzeCurrentFileData = analyzeCurrentFileData;
window.renderSuggestionBox = renderSuggestionBox;
window.selectSuggestedDestination = selectSuggestedDestination;

document.addEventListener("DOMContentLoaded", () => {
  injectTopFolderSuggestionStyles();
  analyzeCurrentFileData();
});
