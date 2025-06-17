import browser from "webextension-polyfill";
import { ACTION } from "./const";
import textEmbedder from "./script/textEmbedder";
import { callAiapi } from "./script/ai";
import { bookmarkUrl } from "./script/bookmark.util";
import { BookmarkManager } from "./script/bookmark";
import OmniboxBookmarkSearch from "./script/omnibox";

textEmbedder.initialize({
  onProgress: (progress: any) => {},
});

new BookmarkManager();
new OmniboxBookmarkSearch();

browser.runtime.onMessage.addListener(async (message, sender) => {
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
      bookmarkDetails = await textEmbedder.detailsEmbeddeding(bookmarkDetails);
      // Store the bookmark
      let value = { [bookmarkDetails.url]: bookmarkDetails };
      await browser.storage.local.set(value);
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
      bookmarkDetails.embedding = await textEmbedder.embedText(
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
  // browser.contextMenus.create({
  //   id: "sendTextToExtension",
  //   title: "Note selected text in Buddy",
  //   contexts: ["selection"],
  // });
  browser.contextMenus.create({
    id: "bookMarkPage",
    title: "Bookmark this page with Buddy",
    contexts: ["page"],
  });
  browser.contextMenus.create({
    id: "search",
    title: "Search bookmarks with Buddy",
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
  if (info.menuItemId === "search") {
    chrome.tabs.create({
      url: chrome.runtime.getURL("src/views/page/page.html"),
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

// chrome.omnibox.onInputEntered.addListener(async (text, sugges) => {
//   if (text === "open") {
//     let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

//     if (tab) {
//       await chrome.sidePanel.open({ tabId: tab?.id || 0 });
//       return;
//     }
//   }
//   let url = text.startsWith("http") ? text : `https://${text}`;
//   chrome.bookmarks.create({ title: "Quick Bookmark", url });
// });

// chrome.omnibox.onInputChanged.addListener(async (text, suggest) => {
//   // Get recent bookmarks
//   const recentBookmarks = await chrome.bookmarks.search(text);

//   // Format suggestions
//   const suggestions = recentBookmarks
//     .filter((bookmark) => bookmark.url) // Filter out bookmarks without URLs
//     .map((bookmark) => ({
//       content: bookmark.url || "", // Ensure content is always a string
//       description: `${bookmark.title}`,
//       // icon: getFaviconFromUrl(bookmark.url || ""), // Use a default icon if URL is not available
//     }));

//   suggest(suggestions);
// });
