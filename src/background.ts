import browser from "webextension-polyfill";
import { ACTION } from "./const";
import { callMiniLLm } from "./script/bookmarkStore";
import textEmbedder from "./script/textEmbedder";
import { callAiapi } from "./script/ai";
import { bookmarkUrl } from "./script/bookmark.util";
console.log("Background script loaded!");

textEmbedder.initialize({
  onProgress: (progress: any) => {
    console.log(`Model loading progress: ${progress.progress * 100}%`);
  },
});

browser.runtime.onMessage.addListener(async (message, sender) => {
  console.log("Message received:", message, sender);

  if (message.action === ACTION.BOOKMARK_URL) {
    const currentPage = message.data;
    let bookmarkDetails = await callAiapi(currentPage);

    const jsonMatch = bookmarkDetails?.result?.response.match(/{[\s\S]*}/);
    if (jsonMatch) {
      const jsonString = jsonMatch[0];
      const jsonObject = JSON.parse(jsonString);
      bookmarkDetails = jsonObject;

      const book = await bookmarkUrl(
        currentPage.url,
        bookmarkDetails.title,
        bookmarkDetails.category
      );

      bookmarkDetails = {
        ...bookmarkDetails,
        ...book,
      };

      // Generate embedding for the bookmark
      try {
        bookmarkDetails.embedding = await callMiniLLm(
          `title: ${bookmarkDetails.title} , category: ${
            bookmarkDetails.details
          } , category: ${bookmarkDetails.category} , url: ${
            bookmarkDetails.url
          } , createdAt: ${new Date(bookmarkDetails.dateAdded).toISOString()}`
        );
      } catch (error) {
        console.error("Error generating embedding:", error);
      }

      // Store the bookmark
      let value = { [bookmarkDetails.url]: bookmarkDetails };
      await browser.storage.local.set(value);

      // Notify other parts of the extension
      browser.runtime.sendMessage({ action: ACTION.UPDATE_TABS });
      browser.runtime.sendMessage({ action: ACTION.UPDATE_VECTORS });
      return Promise.resolve({ success: true, bookmarkDetails });
    } else {
      return Promise.resolve({ success: false, bookmarkDetails });
    }
  }

  if (message.action === ACTION.BOOKMARK_UPDATE) {
    let bookmarkDetails = message.data;
    try {
      bookmarkDetails.embedding = await callMiniLLm(
        `title: ${bookmarkDetails.title} , category: ${
          bookmarkDetails.details
        } , category: ${bookmarkDetails.category} , url: ${
          bookmarkDetails.url
        } , createdAt: ${new Date(bookmarkDetails.dateAdded).toISOString()}`
      );
    } catch (error) {
      console.error("Error generating embedding:", error);
    }
    let value = { [bookmarkDetails.url]: bookmarkDetails };
    await browser.storage.local.set(value);
    browser.runtime.sendMessage({ action: ACTION.UPDATE_TABS });
    browser.runtime.sendMessage({ action: ACTION.UPDATE_VECTORS });
    // return true; // Keep the message channel open for async response
  }
  return Promise.resolve();
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
  // if(info.menuItemId === "sendTextToExtension")
  if (info.menuItemId === "bookMarkPage") {
    browser.storage.local.set({
      action: info.menuItemId,
      text: info.selectionText,
      url: tab?.url,
    });
    await browser.action.openPopup();
    await browser.runtime.sendMessage({
      action: ACTION.BOOKMARK_URL,
      data: { url: tab?.url },
    });
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
