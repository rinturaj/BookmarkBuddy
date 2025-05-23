import browser from "webextension-polyfill";
import { bookmarkFolders, getOrCreateFolder } from "./bookmark.util";
import type { Bookmarks } from "webextension-polyfill";
import { callAiapi } from "./ai";

interface BookmarkAnalysis {
  domain: string;
  category: string;
  title?: string;
  details?: string;
  alternatives?: string[];
  links?: string[];
}

export class BookmarkManager {
  constructor() {
    this.listenToBookmarkEvents();
  }

  private listenToBookmarkEvents() {
    browser.bookmarks.onCreated.addListener(
      this.handleBookmarkCreated.bind(this)
    );
    browser.bookmarks.onChanged.addListener(
      this.handleBookmarkChanged.bind(this)
    );
    browser.bookmarks.onMoved.addListener(this.handleBookmarkMoved.bind(this));
    browser.bookmarks.onRemoved.addListener(
      this.handleBookmarkRemoved.bind(this)
    );
  }

  private async handleBookmarkCreated(
    id: string,
    bookmark: Bookmarks.BookmarkTreeNode
  ) {
    if (bookmark.url) {
      const analysis = await this.analyzeUrl(bookmark.url);
      await this.organizeBookmark(id, bookmark, analysis);
    }
  }

  private async handleBookmarkChanged(
    id: string,
    changeInfo: Bookmarks.OnChangedChangeInfoType
  ) {
    // Need to fetch the bookmark node to get URL
    const bookmarkArr = await browser.bookmarks.get(id);
    const bookmark = bookmarkArr[0];
    if (bookmark && bookmark.url) {
      const analysis = await this.analyzeUrl(bookmark.url);
      await this.organizeBookmark(id, bookmark, analysis);
    }
  }

  private async handleBookmarkMoved(
    id: string,
    moveInfo: Bookmarks.OnMovedMoveInfoType
  ) {
    // Optionally, re-analyze and reorganize if needed
    // You could fetch the bookmark and re-run analysis here if desired
  }

  private handleBookmarkRemoved(
    id: string,
    removeInfo: Bookmarks.OnRemovedRemoveInfoType
  ) {
    // Optionally, handle removal cleanup
  }

  async analyzeUrl(url: string): Promise<BookmarkAnalysis> {
    try {
      await this.sendFloatingProgress("progress", 15);
      const parsed = new URL(url);
      const domain = parsed.hostname.replace(/^www\./, "");
      // Use AI API to analyze and categorize
      // Exponential progress updates from 20 to 70 (non-blocking)
      let progressUpdaterActive = true;
      const progressUpdater = async () => {
        let progress = 20;
        while (progress < 70 && progressUpdaterActive) {
          await this.sendFloatingProgress("progress", progress);
          await new Promise((resolve) => setTimeout(resolve, 2000));
          progress = Math.min(progress * 2, 70);
        }
        if (progressUpdaterActive) {
          await this.sendFloatingProgress("progress", 70);
        }
      };
      const progressPromise = progressUpdater();

      const aiResult = await callAiapi({ url });
      progressUpdaterActive = false;
      await progressPromise;

      // Try to extract JSON from the AI response
      let responseText = aiResult?.result?.response;
      let match = responseText?.match(/{[\s\S]*}/);
      let analysis: BookmarkAnalysis = { domain, category: "Other" };
      if (match) {
        const json = JSON.parse(match[0]);
        analysis = {
          domain,
          category: json.category || "Other",
          title: json.title,
          details: json.details,
          alternatives: json.alternatives,
          links: json.links,
        };
      }
      await this.sendFloatingProgress("progress", 70);
      return analysis;
    } catch (e) {
      await this.sendFloatingProgress("hide");
      return { domain: "unknown", category: "Other" };
    }
  }

  private async organizeBookmark(
    id: string,
    bookmark: Bookmarks.BookmarkTreeNode,
    analysis: BookmarkAnalysis
  ) {
    await this.sendFloatingProgress("progress", 85);
    // Find or create folder for the category
    const parentId = bookmark.parentId || "1"; // 1 is usually the "Bookmarks Bar"
    const folderNode = await getOrCreateFolder(analysis.category, parentId);
    if (folderNode && bookmark.parentId !== folderNode.id) {
      // Move bookmark to the appropriate folder
      await browser.bookmarks.move(id, { parentId: folderNode.id });
    }

    // Store AI analysis metadata in browser.storage.local using the bookmark's URL as key
    if (bookmark.url) {
      const metadata = {
        url: bookmark.url,
        title: analysis.title,
        details: analysis.details,
        category: analysis.category,
        domain: analysis.domain,
        alternatives: analysis.alternatives,
        links: analysis.links,
        dateAdded: bookmark.dateAdded || Date.now(),
        id: bookmark.id,
      };
      await browser.storage.local.set({ [bookmark.url]: metadata });
    }
    await this.sendFloatingProgress("done");
  }

  // Helper: send progress/success to content script
  private async sendFloatingProgress(
    type: "progress" | "done" | "hide",
    progress?: number
  ) {
    try {
      const tabs = await browser.tabs.query({
        active: true,
        currentWindow: true,
      });
      if (tabs.length && tabs[0].id !== undefined) {
        await browser.tabs.sendMessage(tabs[0].id, {
          __bookmarkBuddy: true,
          type,
          progress,
        });
      }
    } catch (e) {
      // Ignore errors (e.g., if no tab is active)
    }
  }
}
