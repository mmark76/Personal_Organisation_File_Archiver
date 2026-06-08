# Personal Memory-Based File Advisor

**Personal Memory-Based File Advisor** is a simple browser-based tool that helps the user think through personal file organisation in a structured but memory-friendly way.

The app suggests possible folder structures and file destinations based on how the user naturally remembers files: by context, period of life, role, responsibility, project, subject, person, or pending action.

The tool is designed mainly as an advisor. It does not move, delete, upload, read, or modify files. It can optionally create the suggested folder tree locally on the user's computer, only after the user chooses a destination folder and gives browser permission.

## Current App

The app is implemented as a standalone HTML file:

```text
index.html
```

It can be opened directly in a web browser.

## What the App Does

The app provides three main functions.

### 1. Suggest Folder Structure

This section helps the user design a folder structure based on personal memory patterns, work periods, responsibilities, life themes, and interests.

It uses a guided interview approach. The user enters information such as:

- profile name;
- main work or life role;
- what they usually remember first when searching for a file;
- work periods or roles;
- work subjects or responsibilities;
- personal life themes;
- interests.

The app then suggests a possible folder structure that follows the user's natural way of remembering information.

The user can also create the suggested folder tree locally by using the **Create Folders on This PC** button. This works only in supported browsers and only after the user gives explicit permission by selecting a local destination folder.

### 2. Suggest File Destination

This section helps the user decide where a specific file may belong.

The suggestion is based on the file's context, subject, role, period, person, theme, or pending action.

The app does not analyse the file automatically. The user remains responsible for describing the file and deciding whether the suggested destination is correct.

### 3. Pending / Reminder

This section helps the user identify files or matters that should remain visible because they require future attention or action.

It is intended for cases where a file should not simply be archived and forgotten.

## Folder Tree Creation

The app can create the suggested folder tree locally on the user's computer.

This is done in two possible ways:

1. **Direct browser folder creation**
   - The user clicks **Create Folders on This PC**.
   - The browser asks the user to choose a destination folder.
   - The app creates the suggested folder tree inside that chosen folder.
   - This requires a supported browser such as Chrome or Edge.

2. **Windows .BAT export**
   - The user downloads a Windows `.BAT` file.
   - The user reviews it before running it.
   - The `.BAT` file creates the suggested folder tree under the folder where it is executed.

## What the App Does Not Do

The app does not:

- move files;
- delete files;
- upload files;
- read the user's file system automatically;
- modify documents;
- replace the user's final decision.

Folder creation is optional and controlled by the user.

## Core Idea

People often do not remember files by file type, exact date, or exact storage location.

Instead, they often remember:

- the context in which the file was created;
- the role they had at the time;
- the project or responsibility involved;
- the life theme or interest connected to the file;
- the person connected to the file;
- whether the file requires future action.

For this reason, the app follows a memory-based approach to file organisation.

## Privacy and Safety

The app is local and browser-based.

It does not upload files or send data to a server.

It does not read or inspect the user's files automatically.

When folder creation is used, the user must manually choose a destination folder and give permission through the browser.

The user should manually check every suggested folder structure or file destination before taking action.

## Related Documentation

The personal philosophy behind this system is documented separately in:

```text
docs/philosophy.md
```

That document explains the memory-based file organisation principles in more depth.

## Project Status

This project is currently a standalone HTML advisory tool with optional local folder tree creation.

Possible future improvements may include:

- clearer user guide documentation;
- export of suggested folder structures;
- optional local storage;
- metadata-based suggestions;
- search or index functions;
- AI-assisted classification;
- safer and clearer folder creation controls.