import browser from "webextension-polyfill";
import { pipeline } from "@xenova/transformers";
import { env } from "@xenova/transformers";

// Disable Web Workers (forces main thread processing)
// env.allowLocalModels = true;
// env.useBrowserCache = false;
// env.localModelPath = "./models/";
// env.backends.onnx.wasm.numThreads = 1; // Reduce complexity
let pipe: any;

async function loadPipe() {
  // pipe = await pipeline("summarization", "Xenova/bart-large-cnn", {
  //   progress_callback: (progress: any) => {
  //     console.log("Progress", progress);
  //   },
  //   cache_dir: "./models",
  // });
  console.log("Pipeline loaded!");
}

browser.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  console.log("Message received:", message);
  const result = await pipe(message.content);
  console.log("Result", result);
});

console.log("Background script loaded!");

// Create context menu when the extension is installed
browser.runtime.onInstalled.addListener(async () => {
  await loadPipe();
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

    // browser.action.openPopup().then((x) => {
    //   console.log("Popup opened!", x);
    //   browser.storage.local.set({
    //     action: info.menuItemId,
    //     text: info.selectionText,
    //     url: tab?.url,
    //   });
    // });
  }
});

browser.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  browser.runtime.sendMessage({ type: "UPDATE_TABS" });
});

browser.tabs.onRemoved.addListener(() => {
  browser.runtime.sendMessage({ type: "UPDATE_TABS" });
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
