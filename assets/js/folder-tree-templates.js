/* Default import-ready folder tree template used by the visible app. */

window.FolderTreeTemplates = (() => {
  const chronological = "001_CHRONOLOGICAL";
  const thematic = "002_THEMATIC";
  const functional = "003_FUNCTIONAL";

  function userNode(name, branch, thinkingType, childLayerType = null, children = []) {
    return { name, fixed: false, branch, thinkingType, childLayerType, children };
  }

  function fixedNode(name, branch, childLayerType = null, children = []) {
    return { name, fixed: true, branch, thinkingType: null, childLayerType, children };
  }

  function professionalPeriod(name) {
    return userNode(name, "professional", chronological, functional, [
      userNode("MAIN_ACTIVITY", "professional", functional),
      userNode("PROJECTS", "professional", functional),
      userNode("DOCUMENTS", "professional", functional),
      userNode("NOTES_AND_REPORTS", "professional", functional),
      userNode("CORRESPONDENCE", "professional", functional),
      userNode("ARCHIVE", "professional", functional)
    ]);
  }

  const defaultTemplate = {
    app: "Personal Memory-Based File Archiver",
    type: "personal-memory-based-folder-tree",
    schemaVersion: 1,
    templateName: "Default Memory-Based Template",
    templateDescription: "The official general-purpose default folder tree used by the app.",
    exportedAt: null,
    folderTree: {
      name: "Organize Your PC",
      fixed: true,
      branch: null,
      thinkingType: null,
      childLayerType: null,
      children: [
        fixedNode("PROFILE", "profile", functional, [
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
        fixedNode("PERSONAL", "personal", thematic, [
          userNode("INBOX", "personal", thematic),
          userNode("FAMILY_AND_FRIENDS", "personal", thematic),
          userNode("HEALTH", "personal", thematic),
          userNode("FINANCE", "personal", thematic),
          userNode("HOBBIES_AND_INTERESTS", "personal", thematic),
          userNode("HOME_AND_ASSETS", "personal", thematic),
          userNode("PHOTOS_AND_VIDEOS", "personal", thematic),
          userNode("DIGITAL_LIFE", "personal", thematic, functional, [
            userNode("ACCOUNTS_AND_ACCESS", "personal", functional),
            userNode("DEVICES_AND_SOFTWARE", "personal", functional),
            userNode("BACKUPS_AND_EXPORTS", "personal", functional)
          ])
        ]),
        fixedNode("PROFESSIONAL", "professional", chronological, [
          userNode("INBOX", "professional", chronological),
          professionalPeriod("PERIOD_1"),
          professionalPeriod("PERIOD_2"),
          professionalPeriod("PERIOD_3"),
          userNode("GENERAL_ARCHIVE", "professional", chronological)
        ])
      ]
    }
  };

  function buildTemplateData(templateId) {
    if (templateId !== "default-example") return null;
    const data = JSON.parse(JSON.stringify(defaultTemplate));
    data.exportedAt = new Date().toISOString();
    return data;
  }

  function buildPreviewLines(node, prefix = "", isLast = true, isRoot = false) {
    const lines = [isRoot ? node.name : `${prefix}${isLast ? "└── " : "├── "}${node.name}`];
    const children = Array.isArray(node.children) ? node.children : [];
    const childPrefix = isRoot ? "" : `${prefix}${isLast ? "    " : "│   "}`;

    children.forEach((child, index) => {
      lines.push(...buildPreviewLines(child, childPrefix, index === children.length - 1));
    });

    return lines;
  }

  function getDefaultTemplatePreviewText() {
    return buildPreviewLines(defaultTemplate.folderTree, "", true, true).join("\n");
  }

  function loadTemplate(templateId) {
    const data = buildTemplateData(templateId);
    if (!data) return false;
    window.FolderTreeImport.importFolderTreeData(data);
    return true;
  }

  return { buildTemplateData, getDefaultTemplatePreviewText, loadTemplate };
})();
