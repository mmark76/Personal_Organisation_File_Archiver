let selectedFile = null;
let currentLanguage = "en";
let latestFolderPaths = [];

const layerTypeLabels = {
  "001_CHRONOLOGICAL": "001 - ΧΡΟΝΙΚΗ",
  "002_THEMATIC": "002 - ΘΕΜΑΤΙΚΗ",
  "003_FUNCTIONAL": "003 - ΛΕΙΤΟΥΡΓΙΚΗ",
  "004_ROLE_BASED": "004 - ΡΟΛΟΥ"
};

const translations = {
  en: {
    appTitle: "Personal Memory-Based File Advisor",
    appSubtitle: "Suggests folder structures and file destinations. It does not move, delete, create, or upload files.",
    languageLabel: "Language",
    tabStructure: "1. Suggest Folder Structure",
    tabDestination: "2. Suggest File Destination",
    tabStatus: "3. Pending / Reminder",
    guidedInterview: "Guided Interview",
    guidedNote: "Answer these questions as the user naturally remembers files. The app will suggest a folder structure.",
    userProfileName: "User / Profile Name",
    nextLayerTitle: "Next layer categorisation",
    profileLayerType: "01_PROFILE next layer logic",
    personalLayerType: "02_PERSONAL next layer logic",
    professionalLayerType: "03_PROFESSIONAL next layer logic",
    profileSecondLevelCategories: "01_PROFILE second-level categories, named one per line",
    personalSecondLevelCategories: "02_PERSONAL second-level categories, named one per line",
    professionalSecondLevelCategories: "03_PROFESSIONAL second-level categories, named one per line",
    memoryQuestion: "When searching for a file, what do you remember first?",
    memoryPeriod: "Period of life",
    memoryRole: "Role / responsibility",
    memoryProject: "Project",
    memoryTheme: "Life theme",
    memoryPerson: "Person / family member",
    memoryDate: "Date",
    memoryFiletype: "File type",
    memoryAction: "Pending action",
    suggestStructureButton: "Suggest Structure",
    loadExampleButton: "Load Markellos Example",
    clearButton: "Clear",
    suggestedStructureTitle: "Suggested Folder Structure",
    structureOutputDefault: "Your suggested structure will appear here.",
    copyStructureButton: "Copy Structure",
    downloadStructureTextButton: "Download Structure TXT",
    downloadBatchButton: "Download Windows .BAT",
    createFoldersButton: "Create Folders on This PC",
    folderCreationNote: "Folder creation is optional. It works only in supported browsers, after the user chooses a local destination folder and gives permission.",
    noStructureYet: "Please generate a folder structure first.",
    batchDownloaded: "Windows .BAT file downloaded. Review it before running.",
    textDownloaded: "Structure TXT file downloaded.",
    unsupportedFileApi: "This browser does not support direct folder creation. Use Chrome or Edge, or download the Windows .BAT file.",
    folderCreationComplete: "Folder structure created successfully.",
    folderCreationCancelled: "Folder creation was cancelled or failed.",
    designPrincipleTitle: "Design Principle",
    designPrincipleText: "This tool suggests a structure. The user remains responsible for the final decision.",
    selectedFileTitle: "Selected File",
    selectedFileLabel: "Selected file:",
    classificationTitle: "Classification",
    mainContext: "Main Context",
    secondLevel: "Second Level",
    thirdLevel: "Third Level",
    secondaryContext: "Secondary Context / Tags",
    reason: "Reason for suggestion",
    previewAdviceButton: "Preview Advice",
    cvExampleButton: "CV Example",
    archivingAdviceTitle: "Archiving Advice",
    destinationPreviewDefault: "Archiving advice will appear here.",
    copyAdviceButton: "Copy Advice",
    adviceOnlyText: "This is advice only. The file is not moved.",
    pendingReminderTitle: "Pending / Reminder Decision",
    fileName: "File name",
    actionStatus: "Status / Action State",
    reminderDate: "Reminder date",
    statusDestination: "Final / temporary folder suggestion",
    notes: "Notes",
    generateStatusButton: "Generate Status Advice",
    statusAdviceTitle: "Status Advice",
    statusOutputDefault: "Pending / reminder advice will appear here.",
    copyStatusButton: "Copy Status Advice",
    suggestedStatusFolders: "Suggested status folders",
    footerText: "Local HTML prototype. No files are moved, deleted, uploaded, created, or modified.",
    copied: "Copied to clipboard.",
    copyFailed: "Copy failed. You can select the text manually.",
    none: "None"
  },
  el: {
    appTitle: "Προσωπικός Σύμβουλος Αρχειοθέτησης με βάση τη Μνήμη",
    appSubtitle: "Προτείνει δομές φακέλων και προορισμούς αρχείων. Δεν μετακινεί, δεν διαγράφει, δεν δημιουργεί και δεν ανεβάζει αρχεία.",
    languageLabel: "Γλώσσα",
    tabStructure: "1. Πρόταση Δομής Φακέλων",
    tabDestination: "2. Πρόταση Προορισμού Αρχείου",
    tabStatus: "3. Εκκρεμότητα / Υπενθύμιση",
    guidedInterview: "Καθοδηγητικές Ερωτήσεις",
    guidedNote: "Απάντησε με βάση το πώς θυμάται φυσικά ο χρήστης τα αρχεία. Το app θα προτείνει δομή φακέλων.",
    userProfileName: "Χρήστης / Όνομα Προφίλ",
    nextLayerTitle: "Κατηγοριοποίηση επόμενου επιπέδου",
    profileLayerType: "Λογική 2ου επιπέδου 01_PROFILE",
    personalLayerType: "Λογική 2ου επιπέδου 02_PERSONAL",
    professionalLayerType: "Λογική 2ου επιπέδου 03_PROFESSIONAL",
    profileSecondLevelCategories: "Κατηγορίες 2ου επιπέδου για 01_PROFILE, ονομαστικά μία ανά γραμμή",
    personalSecondLevelCategories: "Κατηγορίες 2ου επιπέδου για 02_PERSONAL, ονομαστικά μία ανά γραμμή",
    professionalSecondLevelCategories: "Κατηγορίες 2ου επιπέδου για 03_PROFESSIONAL, ονομαστικά μία ανά γραμμή",
    memoryQuestion: "Όταν ψάχνεις ένα αρχείο, τι θυμάσαι πρώτα;",
    memoryPeriod: "Περίοδο ζωής",
    memoryRole: "Ρόλο / ευθύνη",
    memoryProject: "Έργο",
    memoryTheme: "Θέμα ζωής",
    memoryPerson: "Πρόσωπο / μέλος οικογένειας",
    memoryDate: "Ημερομηνία",
    memoryFiletype: "Τύπο αρχείου",
    memoryAction: "Εκκρεμή ενέργεια",
    suggestStructureButton: "Πρότεινε Δομή",
    loadExampleButton: "Φόρτωσε Παράδειγμα Markellos",
    clearButton: "Καθαρισμός",
    suggestedStructureTitle: "Προτεινόμενη Δομή Φακέλων",
    structureOutputDefault: "Η προτεινόμενη δομή θα εμφανιστεί εδώ.",
    copyStructureButton: "Αντιγραφή Δομής",
    downloadStructureTextButton: "Λήψη Δομής TXT",
    downloadBatchButton: "Λήψη Windows .BAT",
    createFoldersButton: "Δημιουργία Φακέλων στο PC",
    folderCreationNote: "Η δημιουργία φακέλων είναι προαιρετική. Λειτουργεί μόνο σε υποστηριζόμενους browsers, αφού ο χρήστης επιλέξει τοπικό φάκελο και δώσει άδεια.",
    noStructureYet: "Πρώτα δημιούργησε προτεινόμενη δομή φακέλων.",
    batchDownloaded: "Το αρχείο Windows .BAT κατέβηκε. Έλεγξέ το πριν το τρέξεις.",
    textDownloaded: "Το αρχείο TXT της δομής κατέβηκε.",
    unsupportedFileApi: "Ο browser δεν υποστηρίζει άμεση δημιουργία φακέλων. Χρησιμοποίησε Chrome ή Edge, ή κατέβασε το Windows .BAT.",
    folderCreationComplete: "Η δομή φακέλων δημιουργήθηκε με επιτυχία.",
    folderCreationCancelled: "Η δημιουργία φακέλων ακυρώθηκε ή απέτυχε.",
    designPrincipleTitle: "Αρχή Σχεδιασμού",
    designPrincipleText: "Το εργαλείο προτείνει δομή. Ο χρήστης κρατά την τελική απόφαση.",
    selectedFileTitle: "Επιλεγμένο Αρχείο",
    selectedFileLabel: "Επιλεγμένο αρχείο:",
    classificationTitle: "Ταξινόμηση",
    mainContext: "Κύριο Πλαίσιο",
    secondLevel: "Δεύτερο Επίπεδο",
    thirdLevel: "Τρίτο Επίπεδο",
    secondaryContext: "Δευτερεύον Πλαίσιο / Tags",
    reason: "Λόγος πρότασης",
    previewAdviceButton: "Προεπισκόπηση Οδηγίας",
    cvExampleButton: "Παράδειγμα CV",
    archivingAdviceTitle: "Οδηγία Αρχειοθέτησης",
    destinationPreviewDefault: "Η οδηγία αρχειοθέτησης θα εμφανιστεί εδώ.",
    copyAdviceButton: "Αντιγραφή Οδηγίας",
    adviceOnlyText: "Αυτό είναι μόνο οδηγία. Το αρχείο δεν μετακινείται.",
    pendingReminderTitle: "Απόφαση Εκκρεμότητας / Υπενθύμισης",
    fileName: "Όνομα αρχείου",
    actionStatus: "Κατάσταση / Ενέργεια",
    reminderDate: "Ημερομηνία υπενθύμισης",
    statusDestination: "Πρόταση τελικού / προσωρινού φακέλου",
    notes: "Σημειώσεις",
    generateStatusButton: "Δημιουργία Οδηγίας Κατάστασης",
    statusAdviceTitle: "Οδηγία Κατάστασης",
    statusOutputDefault: "Η οδηγία εκκρεμότητας / υπενθύμισης θα εμφανιστεί εδώ.",
    copyStatusButton: "Αντιγραφή Οδηγίας Κατάστασης",
    suggestedStatusFolders: "Προτεινόμενοι φάκελοι κατάστασης",
    footerText: "Τοπικό HTML prototype. Δεν μετακινεί, δεν διαγράφει, δεν ανεβάζει, δεν δημιουργεί και δεν τροποποιεί αρχεία.",
    copied: "Αντιγράφηκε στο clipboard.",
    copyFailed: "Η αντιγραφή απέτυχε. Μπορείς να επιλέξεις το κείμενο χειροκίνητα.",
    none: "Κανένα"
  }
};

function t(key) {
  return translations[currentLanguage][key] || translations.en[key] || key;
}

function changeLanguage() {
  currentLanguage = document.getElementById("languageSelect").value;
  document.documentElement.lang = currentLanguage;

  document.querySelectorAll("[data-i18n]").forEach(element => {
    const key = element.getAttribute("data-i18n");
    if (translations[currentLanguage][key]) {
      element.textContent = translations[currentLanguage][key];
    }
  });

  if (selectedFileName.textContent === "None" || selectedFileName.textContent === "Κανένα") {
    selectedFileName.textContent = t("none");
  }
}

function openTab(tabId, button) {
  document.querySelectorAll(".tab").forEach(tab => tab.classList.remove("active"));
  document.querySelectorAll(".tab-button").forEach(btn => btn.classList.remove("active"));

  document.getElementById(tabId).classList.add("active");
  button.classList.add("active");
}

function getLines(id) {
  return document.getElementById(id).value
    .split("\n")
    .map(x => x.trim())
    .filter(Boolean);
}

function getCheckedMemoryPatterns() {
  return Array.from(document.querySelectorAll(".memoryPattern:checked")).map(x => x.value);
}

function sanitizeFolderName(value) {
  return value
    .trim()
    .replace(/[\\/:*?"<>|]/g, "_")
    .replace(/\s+/g, "_")
    .toUpperCase();
}

function addFolderPath(paths, folderPath) {
  const cleanPath = folderPath
    .replace(/\/+?/g, "\\")
    .replace(/\\\\+/g, "\\")
    .replace(/^\\|\\$/g, "");

  if (cleanPath && !paths.includes(cleanPath)) {
    paths.push(cleanPath);
  }
}

function addNamedSecondLevel(paths, outputLines, mainFolder, categories) {
  categories.forEach(category => {
    const cleanCategory = sanitizeFolderName(category);
    addFolderPath(paths, mainFolder + "\\" + cleanCategory);
    outputLines.push("│   ├── " + cleanCategory);
  });
}

function suggestStructure() {
  const userName = document.getElementById("userName").value.trim() || "CUSTOM_USER";
  const patterns = getCheckedMemoryPatterns();
  const profileLayerType = document.getElementById("profileLayerType").value;
  const personalLayerType = document.getElementById("personalLayerType").value;
  const professionalLayerType = document.getElementById("professionalLayerType").value;
  const profileCategories = getLines("profileSecondLevelCategories");
  const personalCategories = getLines("personalSecondLevelCategories");
  const professionalCategories = getLines("professionalSecondLevelCategories");

  let output = "";
  let folderPaths = [];

  output += "Suggested folder structure for: " + userName + "\n\n";

  output += "Selected second-level logic:\n";
  output += "- 01_PROFILE: " + layerTypeLabels[profileLayerType] + "\n";
  output += "- 02_PERSONAL: " + layerTypeLabels[personalLayerType] + "\n";
  output += "- 03_PROFESSIONAL: " + layerTypeLabels[professionalLayerType] + "\n\n";

  output += "Memory pattern detected:\n";
  output += patterns.length ? patterns.map(p => "- " + p).join("\n") : "- Not specified";
  output += "\n\n";

  output += "Recommended principle:\n";
  output += "Main category -> Named second-level categories -> File\n\n";

  output += "DOCUMENTS\n";
  ["00_INBOX", "00_PENDING", "00_TO_REVIEW", "00_WAITING", "00_REMINDERS", "01_PROFILE", "02_PERSONAL", "03_PROFESSIONAL", "04_REFERENCE", "05_ARCHIVE"].forEach(path => addFolderPath(folderPaths, path));

  output += "├── 00_INBOX\n";
  output += "├── 00_PENDING\n";
  output += "├── 00_TO_REVIEW\n";
  output += "├── 00_WAITING\n";
  output += "├── 00_REMINDERS\n";

  output += "├── 01_PROFILE\n";
  const profileOutputLines = [];
  addNamedSecondLevel(folderPaths, profileOutputLines, "01_PROFILE", profileCategories.length ? profileCategories : ["CV", "CERTIFICATES", "APPLICATIONS", "PORTFOLIO", "REFERENCE"]);
  output += profileOutputLines.join("\n") + "\n";

  output += "├── 02_PERSONAL\n";
  const personalOutputLines = [];
  addNamedSecondLevel(folderPaths, personalOutputLines, "02_PERSONAL", personalCategories.length ? personalCategories : ["FAMILY", "HEALTH", "FINANCIAL", "INTERESTS", "REFERENCE"]);
  output += personalOutputLines.join("\n") + "\n";

  output += "├── 03_PROFESSIONAL\n";
  const professionalOutputLines = [];
  addNamedSecondLevel(folderPaths, professionalOutputLines, "03_PROFESSIONAL", professionalCategories.length ? professionalCategories : ["CURRENT_ROLE", "PROJECTS", "ADMINISTRATION", "HEALTH_AND_SAFETY", "REFERENCE"]);
  output += professionalOutputLines.join("\n") + "\n";

  output += "├── 04_REFERENCE\n";
  output += "└── 05_ARCHIVE\n\n";

  output += "Notes:\n";
  output += "- 00 folders are temporary action folders.\n";
  output += "- 01_PROFILE, 02_PERSONAL, and 03_PROFESSIONAL each use the selected second-level logic.\n";
  output += "- The actual second-level folders are the named categories entered by the user.\n";
  output += "- Folder creation is optional and requires user permission.\n";

  latestFolderPaths = folderPaths;
  document.getElementById("structureOutput").textContent = output;
}

function loadMarkellosExample() {
  document.getElementById("userName").value = "Markellos";
  document.getElementById("profileLayerType").value = "003_FUNCTIONAL";
  document.getElementById("personalLayerType").value = "002_THEMATIC";
  document.getElementById("professionalLayerType").value = "001_CHRONOLOGICAL";

  document.getElementById("profileSecondLevelCategories").value =
    "CV\n" +
    "BIOGRAPHY\n" +
    "CERTIFICATES\n" +
    "TRAINING_RECORD\n" +
    "RECOMMENDATION_LETTERS\n" +
    "APPLICATIONS\n" +
    "PRESENTATIONS\n" +
    "PORTFOLIO\n" +
    "MEMBERSHIPS\n" +
    "DIGITAL_PROFILE\n" +
    "BLOGS_AND_PUBLIC_WRITING\n" +
    "REFERENCE";

  document.getElementById("personalSecondLevelCategories").value =
    "FAMILY\n" +
    "HEALTH\n" +
    "FINANCIAL\n" +
    "TRAVELS\n" +
    "INTERESTS\n" +
    "LEARNING\n" +
    "REFERENCE";

  document.getElementById("professionalSecondLevelCategories").value =
    "2002-01-01_to_2010-01-31_PRIVATE_SECTOR\n" +
    "2010-02-01_to_2018-12-31_MECIT\n" +
    "2019-01-01_to_NOW_MECI\n" +
    "PROJECTS\n" +
    "MARINAS_PPP_DBFOT\n" +
    "STATE_FAIR\n" +
    "HEALTH_AND_SAFETY\n" +
    "ADMINISTRATION\n" +
    "REFERENCE";

  document.querySelectorAll(".memoryPattern").forEach(x => x.checked = false);
  ["period", "role", "project", "theme", "action"].forEach(value => {
    const item = Array.from(document.querySelectorAll(".memoryPattern")).find(x => x.value === value);
    if (item) item.checked = true;
  });
}

function clearStructureForm() {
  document.getElementById("userName").value = "";
  document.getElementById("profileLayerType").value = "003_FUNCTIONAL";
  document.getElementById("personalLayerType").value = "002_THEMATIC";
  document.getElementById("professionalLayerType").value = "001_CHRONOLOGICAL";
  document.getElementById("profileSecondLevelCategories").value = "";
  document.getElementById("personalSecondLevelCategories").value = "";
  document.getElementById("professionalSecondLevelCategories").value = "";
  document.querySelectorAll(".memoryPattern").forEach(x => x.checked = false);
  latestFolderPaths = [];
  document.getElementById("structureOutput").textContent = t("structureOutputDefault");
}

const fileInput = document.getElementById("fileInput");
const fileList = document.getElementById("fileList");
const selectedFileName = document.getElementById("selectedFileName");

fileInput.addEventListener("change", function () {
  fileList.innerHTML = "";

  Array.from(fileInput.files).forEach((file, index) => {
    const li = document.createElement("li");
    li.className = "file-item";
    li.textContent = file.name;

    li.addEventListener("click", function () {
      selectFile(file, li);
    });

    fileList.appendChild(li);

    if (index === 0) {
      selectFile(file, li);
    }
  });
});

function selectFile(file, li) {
  document.querySelectorAll(".file-item").forEach(item => item.classList.remove("selected"));
  li.classList.add("selected");
  selectedFile = file;
  selectedFileName.textContent = file.name;
  previewDestination();
}

function previewDestination() {
  const fileName = selectedFile ? selectedFile.name : "[Selected file]";
  const context = document.getElementById("mainContext").value || "[Main Context]";
  const levelTwo = sanitizeFolderName(document.getElementById("levelTwo").value || "[Second Level]");
  const levelThree = sanitizeFolderName(document.getElementById("levelThree").value || "[Third Level]");
  const tags = document.getElementById("secondaryContext").value.trim() || "None";
  const reason = document.getElementById("reason").value.trim() || "No reason written yet.";

  const path = context + "\\" + levelTwo + "\\" + levelThree;

  let advice = "";
  advice += "Archiving suggestion:\n\n";
  advice += "Archive the file:\n";
  advice += fileName + "\n\n";
  advice += "in the folder:\n";
  advice += path + "\n\n";
  advice += "Secondary context / tags:\n";
  advice += tags + "\n\n";
  advice += "Reason:\n";
  advice += reason + "\n\n";
  advice += "Important:\n";
  advice += "This app gives advice only. It does not move the file.";

  document.getElementById("destinationPreview").textContent = advice;
}

function loadCvExample() {
  document.getElementById("mainContext").value = "01_PROFILE";
  document.getElementById("levelTwo").value = "CV";
  document.getElementById("levelThree").value = "GENERAL";
  document.getElementById("secondaryContext").value = "OFFICE, PERSONAL, APPLICATIONS, PROFESSIONAL_IDENTITY";
  document.getElementById("reason").value =
    "This file represents the user's profile and professional identity. It is not only personal and not only office-related.";
  previewDestination();
}

function clearDestinationForm() {
  selectedFile = null;
  fileInput.value = "";
  fileList.innerHTML = "";
  selectedFileName.textContent = t("none");
  document.getElementById("mainContext").value = "";
  document.getElementById("levelTwo").value = "";
  document.getElementById("levelThree").value = "";
  document.getElementById("secondaryContext").value = "";
  document.getElementById("reason").value = "";
  document.getElementById("destinationPreview").textContent = t("destinationPreviewDefault");
}

function generateStatusAdvice() {
  const fileName = document.getElementById("statusFileName").value.trim() || "[File name]";
  const status = document.getElementById("actionStatus").value;
  const reminder = document.getElementById("reminderDate").value || "No reminder date selected";
  const destination = document.getElementById("statusDestination").value.trim() || "[Suggested folder]";
  const notes = document.getElementById("statusNotes").value.trim() || "No notes.";

  let output = "";
  output += "Status / reminder suggestion:\n\n";
  output += "File:\n";
  output += fileName + "\n\n";
  output += "Status:\n";
  output += status + "\n\n";
  output += "Suggested folder:\n";
  output += destination + "\n\n";

  if (status === "FINAL") {
    output += "Advice:\n";
    output += "Archive this file in its final context folder. No further action is needed.\n\n";
  } else if (status === "PENDING") {
    output += "Advice:\n";
    output += "Keep this file in a temporary pending area until the required action is completed.\n\n";
  } else if (status === "TO_REVIEW") {
    output += "Advice:\n";
    output += "Place this file in 00_TO_REVIEW or mark it clearly for review before final archiving.\n\n";
  } else if (status === "WAITING") {
    output += "Advice:\n";
    output += "Keep this file in 00_WAITING until the other person or organization responds.\n\n";
  } else if (status === "REMINDER") {
    output += "Advice:\n";
    output += "Create a reminder to return to this file on the selected date.\n\n";
  } else {
    output += "Advice:\n";
    output += "Keep this file in an action folder until the action is completed.\n\n";
  }

  output += "Reminder date:\n";
  output += reminder + "\n\n";
  output += "Notes:\n";
  output += notes + "\n\n";
  output += "Important:\n";
  output += "This prototype does not create calendar reminders. It only writes the recommendation.";

  document.getElementById("statusOutput").textContent = output;
}

function clearStatusForm() {
  document.getElementById("statusFileName").value = "";
  document.getElementById("actionStatus").value = "FINAL";
  document.getElementById("reminderDate").value = "";
  document.getElementById("statusDestination").value = "";
  document.getElementById("statusNotes").value = "";
  document.getElementById("statusOutput").textContent = t("statusOutputDefault");
}

function downloadFile(filename, content, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function ensureStructureExists() {
  if (!latestFolderPaths.length) {
    alert(t("noStructureYet"));
    return false;
  }
  return true;
}

function downloadStructureText() {
  if (!ensureStructureExists()) return;

  const content =
    document.getElementById("structureOutput").textContent +
    "\n\nFolder paths:\n" +
    latestFolderPaths.join("\n");

  downloadFile("suggested_folder_structure.txt", content, "text/plain;charset=utf-8");
  alert(t("textDownloaded"));
}

function downloadWindowsBatch() {
  if (!ensureStructureExists()) return;

  let content = "";
  content += "@echo off\r\n";
  content += "REM Suggested folder structure creator\r\n";
  content += "REM Review this file before running it.\r\n";
  content += "REM It creates folders only under the folder where this .bat file is executed.\r\n";
  content += "\r\n";
  content += "echo Creating suggested folder structure...\r\n";
  latestFolderPaths.forEach(path => {
    content += 'mkdir "' + path + '" 2>nul\r\n';
  });
  content += "\r\n";
  content += "echo Done.\r\n";
  content += "pause\r\n";

  downloadFile("create_suggested_folder_structure.bat", content, "application/x-bat;charset=utf-8");
  alert(t("batchDownloaded"));
}

async function createFoldersOnComputer() {
  if (!ensureStructureExists()) return;

  if (!window.showDirectoryPicker) {
    alert(t("unsupportedFileApi"));
    return;
  }

  try {
    const rootHandle = await window.showDirectoryPicker();

    for (const folderPath of latestFolderPaths) {
      const parts = folderPath.split("\\").filter(Boolean);
      let currentHandle = rootHandle;

      for (const part of parts) {
        currentHandle = await currentHandle.getDirectoryHandle(part, { create: true });
      }
    }

    alert(t("folderCreationComplete"));
  } catch (error) {
    alert(t("folderCreationCancelled"));
  }
}

function copyText(elementId) {
  const text = document.getElementById(elementId).textContent;
  navigator.clipboard.writeText(text).then(() => {
    alert(t("copied"));
  }).catch(() => {
    alert(t("copyFailed"));
  });
}

changeLanguage();