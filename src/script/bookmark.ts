import browser from "webextension-polyfill";
import { bookmarkFolders, getOrCreateFolder } from "./bookmark.util";
import type { Bookmarks } from "webextension-polyfill";
import { callAiapi } from "./ai";
import textEmbedder from "./textEmbedder";

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
    // browser.bookmarks.onChanged.addListener(
    // //   this.handleBookmarkChanged.bind(this)
    // );
    browser.bookmarks.onMoved.addListener(this.handleBookmarkMoved.bind(this));
    browser.bookmarks.onRemoved.addListener(
      this.handleBookmarkRemoved.bind(this)
    );
  }

  private async handleBookmarkCreated(
    id: string,
    bookmark: Bookmarks.BookmarkTreeNode
  ) {
    if (bookmark.url && bookmark.id) {
      const analysis = await this.analyzeUrl(bookmark.url);
      await this.organizeBookmark(id, bookmark, analysis);
    }
  }

  private async handleBookmarkChanged(
    id: string,
    changeInfo: Bookmarks.OnChangedChangeInfoType
  ) {
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

  private async handleBookmarkRemoved(
    id: string,
    removeInfo: Bookmarks.OnRemovedRemoveInfoType
  ) {
    const url = removeInfo.node.url;
    if (url) {
      await this.sendFloatingProgress("hide", 0, url);
      await browser.storage.local.remove(url);
    }
  }

  async analyzeUrl(url: string): Promise<BookmarkAnalysis> {
    try {
      await this.sendFloatingProgress("progress", 15, url);
      const parsed = new URL(url);
      const domain = parsed.hostname.replace(/^www\./, "");
      // Use AI API to analyze and categorize
      // Exponential progress updates from 20 to 70 (non-blocking)
      let progressUpdaterActive = true;
      const progressUpdater = async () => {
        let progress = 20;
        while (progress < 70 && progressUpdaterActive) {
          await this.sendFloatingProgress("progress", progress, url);
          await new Promise((resolve) => setTimeout(resolve, 2000));
          progress = Math.min(progress * 2, 70);
        }
        if (progressUpdaterActive) {
          await this.sendFloatingProgress("progress", 70, url);
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
      await this.sendFloatingProgress("progress", 70, url);
      return analysis;
    } catch (e) {
      await this.sendFloatingProgress("error", 0, url);
      return { domain: "unknown", category: "Other" };
    }
  }

  private async organizeBookmark(
    id: string,
    bookmark: Bookmarks.BookmarkTreeNode,
    analysis: BookmarkAnalysis
  ) {
    await this.sendFloatingProgress("progress", 85, bookmark.url);

    try {
      // Find or create folder for the category
      const parentId = bookmark.parentId || "1"; // 1 is usually the "Bookmarks Bar"
      const folderNode = await getOrCreateFolder(analysis.category, parentId);
      if (folderNode && bookmark.parentId !== folderNode.id) {
        // Move bookmark to the appropriate folder
        // Try to move the bookmark
        await browser.bookmarks.move(id, { parentId: folderNode.id });
      }
    } catch (error) {
      // If the bookmark was removed, browser.bookmarks.move will throw an error
      // Optionally, trigger any UI update or message to user
      await this.sendFloatingProgress("error", 0, bookmark.url);
      return;
      // Abort further processing
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
      const details = await textEmbedder.detailsEmbeddeding(metadata);
      await browser.storage.local.set({ [bookmark.url]: details });
    }
    await this.sendFloatingProgress("done", 0, bookmark.url);
    setTimeout(() => {
      this.sendFloatingProgress("hide", 0, bookmark.url);
    }, 5000);
  }

  // Helper: send progress/success to content script
  private async sendFloatingProgress(
    type: "progress" | "done" | "hide" | "error",
    progress?: number,
    url?: string
  ) {
    try {
      // Enhanced: Persist all floating progress states in an array for parallel bookmarks
      if (url) {
        const { floatingProgressList = [] } = await browser.storage.local.get(
          "floatingProgressList"
        );
        let list = Array.isArray(floatingProgressList)
          ? floatingProgressList
          : [];
        const idx = list.findIndex((entry: any) => entry.url === url);

        if (type === "hide") {
          // Remove entry for this URL
          if (idx !== -1) list.splice(idx, 1);
        } else {
          const newState: any = {
            url,
            status:
              type === "progress"
                ? "progress"
                : type === "done"
                ? "done"
                : type === "error"
                ? "error"
                : null,
            progressValue: progress ?? 0,
          };
          if (type === "done") {
            const details = await browser.storage.local.get(url);
            newState.bookmarkDetails = details[url] ?? null;
          }
          if (idx !== -1) {
            list[idx] = { ...list[idx], ...newState };
          } else {
            list.push(newState);
          }
        }

        await browser.storage.local.set({ floatingProgressList: list });
      }
      const tabs = await browser.tabs.query({
        active: true,
        currentWindow: true,
      });
      if (tabs.length && tabs[0].id !== undefined) {
        await browser.tabs.sendMessage(tabs[0].id, {
          __bookmarkBuddy: true,
          type,
          progress,
          url,
        });
      }
    } catch (e) {
      // Ignore errors (e.g., if no tab is active)
    }
  }
}
