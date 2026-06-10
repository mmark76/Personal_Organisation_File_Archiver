function getMainFolderCode(node) {
  const match = String(node.name || "").match(/^(\d{2})/);
  return match ? match[1] : null;
}

function padFolderCodePart(value) {
  return String(value).padStart(3, "0");
}

function getFolderDisplayCode(node) {
  const path = getNodePath(node.id).filter(pathNode => pathNode.id !== "root");
  if (!path.length) return "";

  const mainCode = getMainFolderCode(path[0]) || padFolderCodePart(1);
  const codeParts = [mainCode];

  for (let index = 1; index < path.length; index += 1) {
    const parentNode = path[index - 1];
    const currentNode = path[index];
    const siblingIndex = (parentNode.children || []).findIndex(child => child.id === currentNode.id);
    codeParts.push(padFolderCodePart(siblingIndex + 1));
  }

  return codeParts.join(".");
}

function getFolderVisibleName(node) {
  return String(node.name || "").replace(/^\d{2}_/, "");
}

function getNodeDisplayFolderPath(nodeId) {
  return getNodePath(nodeId)
    .filter(node => node.id !== "root")
    .map(node => getFolderVisibleName(node))
    .join("\\");
}

function appendFolderCode(content, node) {
  const code = getFolderDisplayCode(node);
  if (!code) return;

  const codeElement = createTextElement("span", "folder-display-code", code);
  codeElement.title = "Folder selection code";
  content.appendChild(codeElement);
}

function getFolderOutputDisplayName(node) {
  const code = getFolderDisplayCode(node);
  const name = getFolderVisibleName(node);
  return code ? `${code}  ${name}` : name;
}

const originalAppendNodeMetadata = appendNodeMetadata;

appendNodeMetadata = function appendNodeMetadataWithFolderCode(content, node) {
  appendFolderCode(content, node);

  if (node.thinkingType) {
    content.appendChild(createTextElement("div", "node-thinking-type", "Type: " + thinkingTypes[node.thinkingType].label));
  }

  content.appendChild(createTextElement("div", "node-name", getFolderVisibleName(node)));

  if (node.childLayerType) {
    content.appendChild(createTextElement("div", "node-next-layer", "Next layer: " + thinkingTypes[node.childLayerType].label));
  }
};

const originalCreateDestinationChoiceButtonForFolderCodes = createDestinationChoiceButton;
createDestinationChoiceButton = function createDestinationChoiceButtonWithCleanFolderName(child) {
  const button = createButton("", () => selectDestinationNode(child.id), "choice-button");
  button.appendChild(createTextElement("strong", "", getFolderVisibleName(child)));

  if (child.thinkingType) {
    button.appendChild(createTextElement("span", "", thinkingTypes[child.thinkingType].label));
  }

  return button;
};

buildOutputLines = function buildOutputLinesWithFolderCodes(node, depth = 0, lines = []) {
  const indent = depth === 0 ? "" : "│   ".repeat(Math.max(0, depth - 1)) + "├── ";
  lines.push(indent + getFolderOutputDisplayName(node));
  (node.children || []).forEach(child => buildOutputLinesWithFolderCodes(child, depth + 1, lines));
  return lines;
};

function injectFolderTreeCodeStyles() {
  if (document.getElementById("folderTreeCodeStyles")) return;

  const style = document.createElement("style");
  style.id = "folderTreeCodeStyles";
  style.textContent = `
    .folder-display-code {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      justify-self: start;
      width: fit-content;
      padding: 3px 8px;
      border-radius: 999px;
      background: #dbeafe;
      color: #1e40af;
      border: 1px solid #93c5fd;
      font-size: 12px;
      font-weight: 800;
      letter-spacing: 0.03em;
    }

    body.theme-dark .folder-display-code {
      background: #404040;
      color: #f5f5f5;
      border-color: #737373;
    }
  `;
  document.head.appendChild(style);
}

document.addEventListener("DOMContentLoaded", () => {
  injectFolderTreeCodeStyles();
  renderTree();
});