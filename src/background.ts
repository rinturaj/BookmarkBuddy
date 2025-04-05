import browser from "webextension-polyfill";
import { ACTION } from "./const";
console.log("Background script loaded!");

browser.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  // console.log("Message received:", message);
});

// Create context menu when the extension is installed
browser.runtime.onInstalled.addListener(async () => {
  browser.contextMenus.create({
    id: "sendTextToExtension",
    title: "Note selected text in Buddy",
    contexts: ["selection"],
  });
  browser.contextMenus.create({
    id: "bookMarkPage",
    title: "Bookmark this page with Buddy",
    contexts: ["page"],
  });
});

// Listen for clicks on the context menu
browser.contextMenus.onClicked.addListener(async (info, tab) => {
  if (
    info.menuItemId === "sendTextToExtension" ||
    info.menuItemId === "bookMarkPage"
  ) {
    browser.storage.local.set({
      action: info.menuItemId,
      text: info.selectionText,
      url: tab?.url,
    });
    await chrome.sidePanel.open({ tabId: tab?.id || 0 });
  }
});

browser.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  browser.runtime.sendMessage({ action: ACTION.UPDATE_TABS });
});

browser.tabs.onRemoved.addListener(() => {
  browser.runtime.sendMessage({ action: ACTION.UPDATE_TABS });
});
browser.tabs.onActivated.addListener(() => {
  browser.runtime.sendMessage({ action: ACTION.UPDATE_TABS });
});

chrome.omnibox.onInputEntered.addListener(async (text, sugges) => {
  if (text === "open") {
    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    if (tab) {
      await chrome.sidePanel.open({ tabId: tab?.id || 0 });
      return;
    }
  }
  let url = text.startsWith("http") ? text : `https://${text}`;
  chrome.bookmarks.create({ title: "Quick Bookmark", url });
});

chrome.omnibox.onInputChanged.addListener((text, suggest) => {
  suggest([
    { content: "https://google.com", description: "🔍 Google" },
    { content: "https://github.com", description: "💻 GitHub" },
  ]);
});
