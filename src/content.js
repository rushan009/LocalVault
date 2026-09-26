console.log("LocalVault content script loaded");

const fileInputs = document.querySelectorAll('input[type="file"]');
fileInputs.forEach((input) => {
  console.log("File input found:", input);
});

let lastRightClickedInput = null;
let lastRightClickedType = null;

document.addEventListener("contextmenu", (event) => {
  const el = event.target;
  const isFileInput = el.tagName === "INPUT" && el.type === "file";
  const isPasteTarget =
    el.isContentEditable ||
    el.tagName === "TEXTAREA" ||
    (el.tagName === "INPUT" && el.type === "text");

  if (isFileInput || isPasteTarget) {
    lastRightClickedInput = el;
    lastRightClickedType = isFileInput ? "fileInput" : "pasteTarget";
    console.log("Right-clicked target:", lastRightClickedType, el);
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "fillFromVault") {
    console.log("Received fillFromVault message. Target:", lastRightClickedInput, lastRightClickedType);
  }

  if (message.action === "insertFile") {
    if (!lastRightClickedInput) {
      console.log("No target remembered, cannot insert file.");
      return;
    }

    const blob = new Blob([message.fileData], { type: message.fileType });
    const file = new File([blob], message.fileName, { type: message.fileType });

    if (lastRightClickedType === "fileInput") {
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);
      lastRightClickedInput.files = dataTransfer.files;
      console.log("Filled file input:", lastRightClickedInput.files);
    } else if (lastRightClickedType === "pasteTarget") {
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);

      const pasteEvent = new ClipboardEvent("paste", {
        clipboardData: dataTransfer,
        bubbles: true,
        cancelable: true
      });

      lastRightClickedInput.focus();
      lastRightClickedInput.dispatchEvent(pasteEvent);
      console.log("Dispatched synthetic paste event on:", lastRightClickedInput);
    }
  }
});