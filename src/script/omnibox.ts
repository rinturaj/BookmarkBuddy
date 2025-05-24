// OmniboxBookmarkSearch class for BookmarkBuddy
// Allows searching bookmarks from the Chrome omnibox
// The extension's manifest must include:
// "omnibox": { "keyword": "bb" }
// and permissions: ["bookmarks", "omnibox", "tabs", "notifications"]

import { getFaviconFromUrl } from "./bookmark.util";

class OmniboxBookmarkSearch {
  constructor() {
    chrome.omnibox.onInputChanged.addListener(
      this.handleInputChanged.bind(this)
    );
    // chrome.omnibox.onInputEntered.addListener(
    //   this.handleInputEntered.bind(this)
    // );
  }

  handleInputChanged(
    text: string,
    suggest: (suggestResults: chrome.omnibox.SuggestResult[]) => void
  ) {
    if (!text.trim()) {
      suggest([]);
      return;
    }
    chrome.bookmarks.search(text, (results) => {
      const suggestions = results
        .slice(0, 6)
        .map((bm) => ({
          content: bm.url || "",
          description: `${bm.title}`,
        }))
        .filter((s) => s.content);
      suggest(suggestions);
    });
  }

  async handleInputEntered(
    text: string,
    disposition: chrome.omnibox.OnInputEnteredDisposition
  ) {
    if (/^https?:\/\//i.test(text)) {
      this.navigate(text, disposition);
      return;
    }
    // Optionally, you can search bookmarks here if you want to do something else, but do not call suggest here.
    // For now, simply do nothing if the text is not a URL.
    // If you want to navigate to the first matching bookmark, you could do:
    // const recentBookmarks = await chrome.bookmarks.search(text);
    // const firstUrl = recentBookmarks.find(b => b.url)?.url;
    // if (firstUrl) this.navigate(firstUrl, disposition);
    // else do nothing or show a notification.
  }

  navigate(url: string, disposition: chrome.omnibox.OnInputEnteredDisposition) {
    switch (disposition) {
      case "currentTab":
        chrome.tabs.update({ url });
        break;
      case "newForegroundTab":
        chrome.tabs.create({ url });
        break;
      case "newBackgroundTab":
        chrome.tabs.create({ url, active: false });
        break;
    }
  }
}

export default OmniboxBookmarkSearch;
