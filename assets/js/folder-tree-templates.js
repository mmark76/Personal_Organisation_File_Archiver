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
      name: "DOCUMENTS",
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

  const defaultExampleTemplate = buildTemplate(
    "Default Example Template",
    "The official default example folder tree used by the app.",
    buildFolderTree([
      fixedFirstLevelNode("01_PROFILE", "profile", functional, [
        userNode("CVS", "profile", functional),
        userNode("DEGREES", "profile", functional),
        userNode("CERTIFICATES", "profile", functional),
        userNode("REFERENCES", "profile", functional),
        userNode("SUPPORTING_EVIDENCE", "profile", functional)
      ]),
      fixedFirstLevelNode("02_PERSONAL", "personal", thematic, [
        userNode("FAMILY", "personal", thematic),
        userNode("HEALTH", "personal", thematic),
        userNode("FINANCIAL", "personal", thematic),
        userNode("INTERESTS", "personal", thematic, thematic, [
          userNode("CHESS", "personal", thematic),
          userNode("SWIMMING", "personal", thematic),
          userNode("MNEMONIC_TECHNIQUES", "personal", thematic),
          userNode("BLOG_WRITING", "personal", thematic),
          userNode("WEB_APPS", "personal", thematic),
          userNode("LEARNING", "personal", thematic)
        ])
      ]),
      fixedFirstLevelNode("03_PROFESSIONAL", "professional", chronological, [
        userNode("2002-2010_PRIVATE_SECTOR", "professional", chronological),
        userNode("2010-2019_MARINAS_PPP_DBFOT", "professional", chronological),
        userNode("2019-2026_STATE_FAIR_SITE_MANAGEMENT", "professional", chronological),
        userNode("2026-NOW_HEALTH_AND_SAFETY_OFFICER", "professional", chronological)
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
      filename: "default_example_folder_tree_template.json",
      data: defaultExampleTemplate
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
