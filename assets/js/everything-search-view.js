/* Everything search view structure and dedicated-screen navigation. */

window.EverythingSearchView = (() => {
  let viewReady = false;

  function createChoiceButton() {
    const button = document.createElement("button");
    button.type = "button";
    button.id = "openEverythingSearchButton";
    button.className = "choice-card everything-search-choice";
    button.innerHTML = `
      <span class="everything-search-mark" aria-hidden="true"></span>
      <strong>Search this PC</strong>
      <span>Find file and folder names quickly with Everything.</span>
    `;
    return button;
  }

  function createSearchScreen() {
    const screen = document.createElement("section");
    screen.id = "everythingSearchScreen";
    screen.className = "screen everything-search-screen";
    screen.setAttribute("aria-labelledby", "everythingSearchTitle");
    screen.hidden = true;
    screen.setAttribute("aria-hidden", "true");

    screen.innerHTML = `
      <div class="screen-toolbar">
        <button type="button" id="backFromEverythingSearchButton" class="button button-secondary">Back to main choices</button>
      </div>

      <section id="everythingSearchPanel" class="work-panel everything-search-panel" aria-labelledby="everythingSearchTitle">
        <div class="everything-search-heading">
          <span class="everything-search-mark" aria-hidden="true"></span>
          <div class="everything-search-heading-copy">
            <h2 id="everythingSearchTitle">Search this PC</h2>
            <p>A simple local filename and folder search powered by Everything.</p>
          </div>
        </div>

        <form id="everythingSearchForm" class="everything-search-form">
          <label class="sr-only" for="everythingSearchInput">Search file and folder names</label>

          <div class="everything-search-primary-row">
            <span class="everything-search-mark" aria-hidden="true"></span>
            <div class="everything-search-input-wrap">
              <input
                type="search"
                id="everythingSearchInput"
                autocomplete="off"
                maxlength="256"
                placeholder="Search file and folder names"
              />
            </div>
            <button type="submit" id="everythingSearchButton" class="button everything-search-button">Search</button>
            <button type="button" id="everythingSearchCancelButton" class="button button-secondary everything-search-cancel-button" hidden>Cancel</button>
          </div>

          <div class="everything-search-filter-row">
            <label for="everythingSearchTypeSelect">Show</label>
            <select id="everythingSearchTypeSelect">
              <option value="all" selected>All results</option>
              <option value="file">Files only</option>
              <option value="folder">Folders only</option>
            </select>
            <input type="hidden" id="everythingSearchLimitInput" value="20" />
          </div>
        </form>

        <div id="everythingSearchStatus" class="everything-search-status status-idle" aria-live="polite">
          Open this screen to check the local Everything connection.
        </div>

        <section id="everythingSetupPanel" class="everything-setup-panel" aria-labelledby="everythingSetupTitle" hidden>
          <h3 id="everythingSetupTitle">Everything is required</h3>
          <p>Install Everything by voidtools, start it on this Windows PC, and then check the connection again.</p>

          <div class="everything-setup-actions">
            <a id="everythingDownloadLink" class="button" href="https://www.voidtools.com/downloads/">Download Everything</a>
            <button type="button" id="toggleEverythingInstallGuideButton" class="button button-secondary" aria-expanded="false">Installation Guide</button>
            <button type="button" id="everythingCheckAgainButton" class="button button-secondary">Check Again</button>
          </div>

          <div id="everythingInstallGuide" class="everything-install-guide" hidden>
            <ol>
              <li>Open the official voidtools download page.</li>
              <li>Choose the current 64-bit installer for a normal Windows installation.</li>
              <li>Run the installer and keep the Everything service option enabled.</li>
              <li>Start Everything and allow it to finish its first local index.</li>
              <li>Return here and select Check Again.</li>
            </ol>
          </div>

          <p class="everything-search-privacy-note">Search stays on this computer. File names and paths are not uploaded by this feature.</p>
        </section>

        <div id="everythingSearchResults" class="everything-search-results" aria-live="polite"></div>
        <p class="everything-search-attribution">Search powered by Everything by voidtools.</p>
      </section>
    `;

    return screen;
  }

  function setActiveScreen(screenId) {
    document.querySelectorAll(".app-main > .screen").forEach(screen => {
      const active = screen.id === screenId;
      screen.hidden = !active;
      screen.setAttribute("aria-hidden", String(!active));
      screen.classList.toggle("screen-active", active);
    });

    const activeTitle = document.querySelector(`#${screenId} h2`);
    if (activeTitle) {
      activeTitle.setAttribute("tabindex", "-1");
      activeTitle.focus();
    }
  }

  function showSearchScreen() {
    setActiveScreen("everythingSearchScreen");
    window.EverythingSearch?.activate?.();
  }

  function showMainChoices() {
    setActiveScreen("mainChoiceScreen");
  }

  function ensureView() {
    if (viewReady) return true;

    const mainChoiceScreen = document.getElementById("mainChoiceScreen");
    const choiceGrid = mainChoiceScreen?.querySelector(".choice-grid");
    if (!mainChoiceScreen || !choiceGrid) {
      return false;
    }

    mainChoiceScreen.querySelector(".companion-tip-panel")?.remove();
    mainChoiceScreen.querySelector("#everythingSearchPanel")?.remove();

    let openButton = document.getElementById("openEverythingSearchButton");
    if (!openButton) {
      openButton = createChoiceButton();
      choiceGrid.appendChild(openButton);
    }

    let searchScreen = document.getElementById("everythingSearchScreen");
    if (!searchScreen) {
      searchScreen = createSearchScreen();
      mainChoiceScreen.insertAdjacentElement("afterend", searchScreen);
    }

    openButton.addEventListener("click", showSearchScreen);
    document.getElementById("backFromEverythingSearchButton")?.addEventListener("click", showMainChoices);

    viewReady = true;
    return true;
  }

  return {
    ensureView,
    showSearchScreen,
    showMainChoices
  };
})();
