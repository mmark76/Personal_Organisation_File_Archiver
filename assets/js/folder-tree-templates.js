/* Official import-ready folder tree templates. */

window.FolderTreeTemplates = (() => {
  const { downloadTextFile } = window.AppUtils;

  const appName = "Personal Memory-Based File Archiver";
  const templateType = "personal-memory-based-folder-tree";
  const schemaVersion = 1;

  const chronological = "001_CHRONOLOGICAL";
  const thematic = "002_THEMATIC";
  const functional = "003_FUNCTIONAL";

  function userNode(name, branch, thinkingType, childLayerType = null, children = []) {
    return {
      name,
      fixed: false,
      branch,
      thinkingType,
      childLayerType,
      children
    };
  }

  function fixedFirstLevelNode(name, branch, childLayerType = null, children = []) {
    return {
      name,
      fixed: true,
      branch,
      thinkingType: null,
      childLayerType,
      children
    };
  }

  function buildFolderTree(children) {
    return {
      name: "Organize Your PC",
      fixed: true,
      branch: null,
      thinkingType: null,
      childLayerType: null,
      children
    };
  }

  function buildTemplate(templateName, templateDescription, folderTree) {
    return {
      app: appName,
      type: templateType,
      schemaVersion,
      templateName,
      templateDescription,
      exportedAt: null,
      folderTree
    };
  }

  function createChessBranch() {
    return userNode("CHESS", "personal", thematic, functional, [
      userNode("PROFILE", "personal", functional),
      userNode("GAMES", "personal", functional),
      userNode("BOOKS", "personal", functional),
      userNode("OPENINGS", "personal", functional),
      userNode("MIDDLEGAME", "personal", functional),
      userNode("ENDGAMES", "personal", functional),
      userNode("COURSES", "personal", functional),
      userNode("TRAINING", "personal", functional),
      userNode("PREPARATION", "personal", functional),
      userNode("ARCHIVE", "personal", functional)
    ]);
  }

  function createDefaultChildren(includeChessBranch = false) {
    const hobbiesChildren = includeChessBranch ? [createChessBranch()] : [];

    return [
      fixedFirstLevelNode("PROFILE", "profile", functional, [
        userNode("INBOX", "profile", functional),
        userNode("IDENTITY", "profile", functional, functional, [
          userNode("ID_CARD", "profile", functional),
          userNode("PASSPORT", "profile", functional),
          userNode("DRIVING_LICENSE", "profile", functional),
          userNode("PERSONAL_DETAILS", "profile", functional)
        ]),
        userNode("OFFICIAL_RECORDS", "profile", functional),
        userNode("PROFESSIONAL_LICENSES", "profile", functional),
        userNode("CV", "profile", functional),
        userNode("DEGREES", "profile", functional),
        userNode("CERTIFICATES", "profile", functional),
        userNode("REFERENCES", "profile", functional),
        userNode("PUBLIC_PROFILE_AND_PORTFOLIO", "profile", functional)
      ]),
      fixedFirstLevelNode("PERSONAL", "personal", thematic, [
        userNode("INBOX", "personal", thematic),
        userNode("FAMILY_AND_FRIENDS", "personal", thematic),
        userNode("HEALTH", "personal", thematic),
        userNode("FINANCE", "personal", thematic),
        userNode("HOBBIES_AND_INTERESTS", "personal", thematic, includeChessBranch ? thematic : null, hobbiesChildren),
        userNode("HOME_AND_ASSETS", "personal", thematic),
        userNode("PHOTOS_AND_VIDEOS", "personal", thematic),
        userNode("DIGITAL_LIFE", "personal", thematic, functional, [
          userNode("ACCOUNTS_AND_ACCESS", "personal", functional),
          userNode("DEVICES_AND_SOFTWARE", "personal", functional),
          userNode("BACKUPS_AND_EXPORTS", "personal", functional)
        ])
      ]),
      fixedFirstLevelNode("PROFESSIONAL", "professional", chronological, [
        userNode("INBOX", "professional", chronological),
        userNode("PERIOD_1", "professional", chronological, functional, [
          userNode("MAIN_ACTIVITY", "professional", functional),
          userNode("PROJECTS", "professional", functional),
          userNode("DOCUMENTS", "professional", functional),
          userNode("NOTES_AND_REPORTS", "professional", functional),
          userNode("CORRESPONDENCE", "professional", functional),
          userNode("ARCHIVE", "professional", functional)
        ]),
        userNode("PERIOD_2", "professional", chronological, functional, [
          userNode("MAIN_ACTIVITY", "professional", functional),
          userNode("PROJECTS", "professional", functional),
          userNode("DOCUMENTS", "professional", functional),
          userNode("NOTES_AND_REPORTS", "professional", functional),
          userNode("CORRESPONDENCE", "professional", functional),
          userNode("ARCHIVE", "professional", functional)
        ]),
        userNode("PERIOD_3", "professional", chronological, functional, [
          userNode("MAIN_ACTIVITY", "professional", functional),
          userNode("PROJECTS", "professional", functional),
          userNode("DOCUMENTS", "professional", functional),
          userNode("NOTES_AND_REPORTS", "professional", functional),
          userNode("CORRESPONDENCE", "professional", functional),
          userNode("ARCHIVE", "professional", functional)
        ]),
        userNode("GENERAL_ARCHIVE", "professional", chronological)
      ])
    ];
  }

  const blankValidTemplate = buildTemplate(
    "Blank Valid Template",
    "A strict blank folder tree with only the fixed first-level folders.",
    buildFolderTree([
      fixedFirstLevelNode("PROFILE", "profile"),
      fixedFirstLevelNode("PERSONAL", "personal"),
      fixedFirstLevelNode("PROFESSIONAL", "professional")
    ])
  );

  const defaultTemplate = buildTemplate(
    "Default Memory-Based Template",
    "The official general-purpose default folder tree used by the app.",
    buildFolderTree(createDefaultChildren(false))
  );

  const defaultTemplateWithChessBranch = buildTemplate(
    "Default Memory-Based Template with Chess Branch",
    "The official default folder tree with CHESS under PERSONAL / HOBBIES_AND_INTERESTS.",
    buildFolderTree(createDefaultChildren(true))
  );

  const professionalTimelineTemplate = buildTemplate(
    "Professional Timeline Template",
    "A professional chronological folder tree template for career periods and roles.",
    buildFolderTree([
      fixedFirstLevelNode("PROFILE", "profile"),
      fixedFirstLevelNode("PERSONAL", "personal"),
      fixedFirstLevelNode("PROFESSIONAL", "professional", chronological, [
        userNode("2020-2022_FOUNDATION", "professional", chronological),
        userNode("2023-2024_GROWTH", "professional", chronological),
        userNode("2025-NOW_CURRENT_ROLE", "professional", chronological)
      ])
    ])
  );

  const templates = {
    blank: {
      filename: "blank_valid_folder_tree_template.json",
      data: blankValidTemplate
    },
    "default-example": {
      filename: "default_folder_tree_template.json",
      data: defaultTemplate
    },
    "default-with-chess": {
      filename: "default_folder_tree_with_chess_branch_template.json",
      data: defaultTemplateWithChessBranch
    },
    "professional-timeline": {
      filename: "professional_timeline_folder_tree_template.json",
      data: professionalTimelineTemplate
    }
  };

  function cloneData(data) {
    return JSON.parse(JSON.stringify(data));
  }

  function buildTemplateData(templateId) {
    const template = templates[templateId];
    if (!template) return null;

    const data = cloneData(template.data);
    data.exportedAt = new Date().toISOString();
    return data;
  }

  function buildFolderTreePreviewLines(node, prefix = "", isLast = true, isRoot = false) {
    const lines = [];

    if (isRoot) {
      lines.push(node.name);
    } else {
      const connector = isLast ? "└── " : "├── ";
      lines.push(`${prefix}${connector}${node.name}`);
    }

    const children = Array.isArray(node.children) ? node.children : [];
    const childPrefix = isRoot ? "" : `${prefix}${isLast ? "    " : "│   "}`;

    children.forEach((child, index) => {
      const childIsLast = index === children.length - 1;
      lines.push(...buildFolderTreePreviewLines(child, childPrefix, childIsLast));
    });

    return lines;
  }

  function getDefaultTemplatePreviewText(templateId = "default-example") {
    const data = buildTemplateData(templateId);
    if (!data?.folderTree) return "Default folder tree preview is not available.";

    return buildFolderTreePreviewLines(data.folderTree, "", true, true).join("\n");
  }

  function loadTemplate(templateId) {
    const data = buildTemplateData(templateId);
    if (!data) return false;

    window.FolderTreeImport.importFolderTreeData(data);
    return true;
  }

  function downloadTemplate(templateId) {
    const template = templates[templateId];
    const data = buildTemplateData(templateId);
    if (!template || !data) return;

    downloadTextFile(
      template.filename,
      JSON.stringify(data, null, 2),
      "application/json;charset=utf-8"
    );
  }

  return {
    buildTemplateData,
    downloadTemplate,
    getDefaultTemplatePreviewText,
    loadTemplate
  };
})();
