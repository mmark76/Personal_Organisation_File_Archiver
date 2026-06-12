/* Build mode template selector. */

window.TemplateSelector = (() => {
  function qs(selector, root = document) {
    return root.querySelector(selector);
  }

  function createTemplateButton(label, templateId) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "button button-secondary";
    button.textContent = label;
    button.addEventListener("click", () => {
      const loaded = window.FolderTreeTemplates?.loadTemplate?.(templateId);
      const status = qs("#treeTemplateStatus");
      if (status) status.textContent = loaded ? `${label} loaded.` : "Template could not be loaded.";
    });
    return button;
  }

  function initialize() {
    const originalButton = qs("#loadExampleTreeButton");
    if (!originalButton || qs("#buildTemplateChoicePanel")) return;

    const button = originalButton.cloneNode(true);
    button.textContent = "Choose Template to Load";
    originalButton.replaceWith(button);

    const panel = document.createElement("div");
    panel.id = "buildTemplateChoicePanel";
    panel.className = "action-row";
    panel.hidden = true;
    panel.setAttribute("aria-label", "Template choices");

    panel.append(
      createTemplateButton("Default Memory-Based Template", "default-example"),
      createTemplateButton("Default Template with Chess Branch", "default-with-chess")
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
