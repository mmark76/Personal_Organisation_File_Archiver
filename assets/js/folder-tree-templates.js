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

  const blankValidTemplate = buildTemplate(
    "Blank Valid Template",
    "A strict blank folder tree with only the fixed first-level folders.",
    buildFolderTree([
      fixedFirstLevelNode("01_PROFILE", "profile"),
      fixedFirstLevelNode("02_PERSONAL", "personal"),
      fixedFirstLevelNode("03_PROFESSIONAL", "professional")
    ])
  );

  const defaultTemplate = buildTemplate(
    "Default Template",
    "The official general-purpose default folder tree used by the app.",
    buildFolderTree([
      fixedFirstLevelNode("01_PROFILE", "profile", functional, [
        userNode("00_INBOX", "profile", functional),
        userNode("01_IDENTITY", "profile", functional, functional, [
          userNode("01_ID_CARD", "profile", functional),
          userNode("02_PASSPORT", "profile", functional),
          userNode("03_DRIVING_LICENSE", "profile", functional),
          userNode("04_PERSONAL_DETAILS", "profile", functional)
        ]),
        userNode("02_OFFICIAL_RECORDS", "profile", functional),
        userNode("03_PROFESSIONAL_LICENSES", "profile", functional),
        userNode("04_CV", "profile", functional),
        userNode("05_DEGREES", "profile", functional),
        userNode("06_CERTIFICATES", "profile", functional),
        userNode("07_REFERENCES", "profile", functional),
        userNode("08_PUBLIC_PROFILE_AND_PORTFOLIO", "profile", functional)
      ]),
      fixedFirstLevelNode("02_PERSONAL", "personal", thematic, [
        userNode("00_INBOX", "personal", thematic),
        userNode("01_FAMILY_AND_FRIENDS", "personal", thematic),
        userNode("02_HEALTH", "personal", thematic),
        userNode("03_FINANCE", "personal", thematic),
        userNode("04_HOBBIES_AND_INTERESTS", "personal", thematic),
        userNode("05_HOME_AND_ASSETS", "personal", thematic),
        userNode("06_PHOTOS_AND_VIDEOS", "personal", thematic),
        userNode("07_DIGITAL_LIFE", "personal", thematic, functional, [
          userNode("01_ACCOUNTS_AND_ACCESS", "personal", functional),
          userNode("02_DEVICES_AND_SOFTWARE", "personal", functional),
          userNode("03_BACKUPS_AND_EXPORTS", "personal", functional)
        ])
      ]),
      fixedFirstLevelNode("03_PROFESSIONAL", "professional", chronological, [
        userNode("00_INBOX", "professional", chronological),
        userNode("01_PERIOD_1", "professional", chronological, functional, [
          userNode("01_MAIN_ACTIVITY", "professional", functional),
          userNode("02_PROJECTS", "professional", functional),
          userNode("03_DOCUMENTS", "professional", functional),
          userNode("04_NOTES_AND_REPORTS", "professional", functional),
          userNode("05_CORRESPONDENCE", "professional", functional),
          userNode("06_ARCHIVE", "professional", functional)
        ]),
        userNode("02_PERIOD_2", "professional", chronological, functional, [
          userNode("01_MAIN_ACTIVITY", "professional", functional),
          userNode("02_PROJECTS", "professional", functional),
          userNode("03_DOCUMENTS", "professional", functional),
          userNode("04_NOTES_AND_REPORTS", "professional", functional),
          userNode("05_CORRESPONDENCE", "professional", functional),
          userNode("06_ARCHIVE", "professional", functional)
        ]),
        userNode("03_PERIOD_3", "professional", chronological, functional, [
          userNode("01_MAIN_ACTIVITY", "professional", functional),
          userNode("02_PROJECTS", "professional", functional),
          userNode("03_DOCUMENTS", "professional", functional),
          userNode("04_NOTES_AND_REPORTS", "professional", functional),
          userNode("05_CORRESPONDENCE", "professional", functional),
          userNode("06_ARCHIVE", "professional", functional)
        ]),
        userNode("04_GENERAL_ARCHIVE", "professional", chronological)
      ])
    ])
  );

  const professionalTimelineTemplate = buildTemplate(
    "Professional Timeline Template",
    "A professional chronological folder tree template for career periods and roles.",
    buildFolderTree([
      fixedFirstLevelNode("01_PROFILE", "profile"),
      fixedFirstLevelNode("02_PERSONAL", "personal"),
      fixedFirstLevelNode("03_PROFESSIONAL", "professional", chronological, [
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
    downloadTemplate
  };
})();