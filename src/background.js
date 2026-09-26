console.log("background script is running");

chrome.contextMenus.create({
  id: "use-from-local-vault",
  title: "Use from Local Vault",
  contexts: ["all"]
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  console.log("Context menu item clicked:", info, tab);

  chrome.tabs.sendMessage(tab.id, { action: "fillFromVault" });

  chrome.storage.local.set({ pickMode: true, targetTabId: tab.id });

  chrome.action.openPopup();
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "selectedFileForVault") {
    chrome.storage.local.get(["targetTabId"], (result) => {
      const targetTabId = result.targetTabId;
      chrome.tabs.sendMessage(targetTabId, {
        action: "insertFile",
        fileName: message.fileName,
        fileType: message.fileType,
        fileData: message.fileData
      });
    });

    chrome.storage.local.set({ pickMode: false });
  }
});