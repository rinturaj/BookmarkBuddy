import browser from "webextension-polyfill";

browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("Message received:", message);
});

console.log("Background script loaded!");

// Create context menu when the extension is installed
browser.runtime.onInstalled.addListener(() => {
  browser.contextMenus.create({
    id: "sendTextToExtension",
    title: "Note selected text in Buddy",
    contexts: ["selection"],
  });
  browser.contextMenus.create({
    id: "bookMarkPage",
    title: "Bookmark this page with Buddy",
    contexts: ["selection"],
  });
});

// Listen for clicks on the context menu
browser.contextMenus.onClicked.addListener((info, tab) => {
  if (
    info.menuItemId === "sendTextToExtension" ||
    info.menuItemId === "bookMarkPage"
  ) {
    browser.storage.local.set({
      action: info.menuItemId,
      text: info.selectionText,
      url: tab?.url,
    });

    browser.action.openPopup().then((x) => {
      console.log("Popup opened!", x);
      browser.storage.local.set({
        action: info.menuItemId,
        text: info.selectionText,
        url: tab?.url,
      });
    });
  }
});
