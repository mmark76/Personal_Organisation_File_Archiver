/* Build mode template selector. */

window.TemplateSelector = (() => {
  function qs(selector, root = document) {
    return root.querySelector(selector);
  }

  function createNode(name, branch, thinkingType, childLayerType = null, children = []) {
    return window.FolderTree.createNode(name, branch, thinkingType, childLayerType, children);
  }

  function normalizeMotherFolderCode(value) {
    return String(value || "").trim();
  }

  function isValidMotherFolderCode(value) {
    return /^\d{2}(\.\d{3})*$/.test(value);
  }

  function buildChildDisplayCode(parentCode, childIndex) {
    return `${parentCode}.${String(childIndex + 1).padStart(3, "0")}`;
  }

  function applyDisplayCodes(node, parentCode, childIndex) {
    const nodeCode = buildChildDisplayCode(parentCode, childIndex);
    node.displayCode = nodeCode;

    (node.children || []).forEach((child, index) => {
      applyDisplayCodes(child, nodeCode, index);
    });
  }

  function createFullChessBranch(motherFolderCode) {
    const thematic = "002_THEMATIC";
    const functional = "003_FUNCTIONAL";

    const chess = createNode("CHESS", "personal", thematic, thematic, [
      createNode("PROFILE", "personal", thematic, functional, [
        createNode("CHESS_IDS", "personal", functional),
        createNode("CERTIFICATES", "personal", functional)
      ]),
      createNode("GAMES", "personal", thematic, functional, [
        createNode("MY_GAMES_ANALYZED", "personal", functional),
        createNode("MODEL_GAMES", "personal", functional),
        createNode("CLASSICAL_GAMES", "personal", functional),
        createNode("ANNOTATED_GAMES", "personal", functional)
      ]),
      createNode("BOOKS", "personal", thematic),
      createNode("OPENINGS", "personal", thematic, functional, [
        createNode("WHITE", "personal", functional),
        createNode("BLACK", "personal", functional)
      ]),
      createNode("MIDDLEGAME", "personal", thematic, functional, [
        createNode("TYPICAL_PLANS", "personal", functional),
        createNode("STRATEGY", "personal", functional)
      ]),
      createNode("ENDGAMES", "personal", thematic, functional, [
        createNode("BASIC_ENDGAMES", "personal", functional),
        createNode("THEORETICAL_ENDGAMES", "personal", functional),
        createNode("PRACTICAL_ENDGAMES", "personal", functional),
        createNode("ENDGAME_STUDIES", "personal", functional)
      ]),
      createNode("COURSES", "personal", thematic),
      createNode("TRAINING", "personal", thematic, functional, [
        createNode("TACTICS", "personal", functional),
        createNode("CALCULATION", "personal", functional),
        createNode("ENDGAME", "personal", functional),
        createNode("VISUALIZATION", "personal", functional)
      ]),
      createNode("PREPARATION", "personal", thematic, functional, [
        createNode("OPPONENT_01", "personal", functional),
        createNode("OPPONENT_02", "personal", functional),
        createNode("OPPONENT_03", "personal", functional),
        createNode("TOURNAMENT_PREPARATION", "personal", functional),
        createNode("GENERAL_GAME_PREPARATION", "personal", functional)
      ]),
      createNode("ARCHIVE", "personal", thematic)
    ]);

    applyDisplayCodes(chess, motherFolderCode, 0);
    return chess;
  }

  function loadChessTemplate() {
    const motherFolderCode = normalizeMotherFolderCode(
      window.prompt("Enter the mother folder code where CHESS will be placed, for example 02.005:")
    );

    if (!motherFolderCode) return false;

    if (!isValidMotherFolderCode(motherFolderCode)) {
      window.alert("Please enter a valid mother folder code, for example 02.005.");
      return false;
    }

    window.AppState.resetNodeCounter();
    window.AppState.setTree({
      id: "documents",
      name: "Organize Your PC",
      fixed: true,
      branch: null,
      thinkingType: null,
      childLayerType: null,
      children: [createFullChessBranch(motherFolderCode)]
    });

    window.FolderTreeRender.renderAll();
    return true;
  }

  function loadSelectedTemplate(templateId) {
    if (templateId === "chess-template") return loadChessTemplate();
    return Boolean(window.FolderTreeTemplates?.loadTemplate?.(templateId));
  }

  function createTemplateButton(label, templateId) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "button button-secondary";
    button.textContent = label;
    button.addEventListener("click", () => {
      const loaded = loadSelectedTemplate(templateId);
      const status = qs("#treeTemplateStatus");
      if (status) status.textContent = loaded ? `${label} loaded.` : "Template was not loaded.";
    });
    return button;
  }

  function initialize() {
    const originalButton = qs("#loadExampleTreeButton");
    if (!originalButton || qs("#buildTemplateChoicePanel")) return;

    const button = originalButton.cloneNode(true);
    button.textContent = "Choose Template to Load from the Templates Library";
    originalButton.replaceWith(button);

    const panel = document.createElement("div");
    panel.id = "buildTemplateChoicePanel";
    panel.className = "action-row";
    panel.hidden = true;
    panel.setAttribute("aria-label", "Template choices");

    panel.append(
      createTemplateButton("Default Memory-Based Template", "default-example"),
      createTemplateButton("Chess Template", "chess-template")
    );

    const status = document.createElement("p");
    status.id = "treeTemplateStatus";
    status.className = "small-note";
    status.textContent = "Choose a template to load into the current folder tree.";

    button.insertAdjacentElement("afterend", panel);
    panel.insertAdjacentElement("afterend", status);

    button.addEventListener("click", () => {
      panel.hidden = !panel.hidden;
    });
  }

  document.addEventListener("DOMContentLoaded", initialize);

  return { initialize };
})();
