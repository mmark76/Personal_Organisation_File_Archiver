/* Shared exclusive lock for file and folder archive actions. */

window.ArchiveOperation = (() => {
  const webLockName = "organize-your-pc-archive-operation";
  const archiveButtonIds = ["archiveFileButton", "archiveFolderButton"];
  let activeToken = null;

  function setResult(selector, message) {
    window.AppUtils.setText(selector, message);
  }

  function reportIfBusy(resultSelector) {
    if (!activeToken) return false;
    setResult(resultSelector, window.AppMessages.archiveAlreadyInProgress);
    return true;
  }

  function disableArchiveButtons(token) {
    token.buttonStates = archiveButtonIds.map(id => {
      const button = document.getElementById(id);
      const wasDisabled = Boolean(button?.disabled);
      if (button) button.disabled = true;
      return { button, wasDisabled };
    });
  }

  function restoreArchiveButtons(token) {
    for (const { button, wasDisabled } of token.buttonStates || []) {
      if (button) button.disabled = wasDisabled;
    }
  }

  async function runExclusive(resultSelector, operation, failureMessage = window.AppMessages.archiveFailed) {
    if (reportIfBusy(resultSelector)) return false;

    const token = {};
    activeToken = token;
    disableArchiveButtons(token);

    const runOperation = async () => {
      setResult(resultSelector, window.AppMessages.archiveInProgress);
      await operation();
      return true;
    };

    try {
      if (typeof navigator !== "undefined" && navigator.locks?.request) {
        return await navigator.locks.request(webLockName, { ifAvailable: true }, async lock => {
          if (!lock) {
            setResult(resultSelector, window.AppMessages.archiveAlreadyInProgress);
            return false;
          }

          return runOperation();
        });
      }

      return await runOperation();
    } catch (error) {
      setResult(resultSelector, failureMessage);
      return false;
    } finally {
      if (activeToken === token) activeToken = null;
      restoreArchiveButtons(token);
    }
  }

  return {
    reportIfBusy,
    runExclusive
  };
})();
