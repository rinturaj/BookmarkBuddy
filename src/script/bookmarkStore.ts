import { derived, get, writable } from "svelte/store";
import textEmbedder from "./textEmbedder";
import Browser from "webextension-polyfill";
import { ACTION } from "../const";

export const bookmarks = writable<any[]>([]);
export const searchResult = writable<any[]>([]);
export const isSearching = writable(false);
export const modelProgress = writable(0);
export const searchStatus = writable("");
export const activeCategory = writable("");

// Create a Web Worker for search operations
const searchWorker = new Worker(new URL("./searchWorker.ts", import.meta.url), {
  type: "module",
});

// Handle messages from the worker
searchWorker.onmessage = (e) => {
  const { type, ...data } = e.data;

  switch (type) {
    case "progress":
      modelProgress.set(data.progress);
      searchStatus.set(data.status);
      break;
    case "status":
      searchStatus.set(data.status);
      break;
    case "results":
      searchResult.set(data.results);
      searchStatus.set(data.status);
      setTimeout(() => {
        isSearching.set(false);
      }, 1000);
      break;
    case "error":
      console.error("Search error:", data.error);
      searchResult.set([]);
      searchStatus.set(data.status);
      isSearching.set(false);
      break;
  }
};

searchWorker.onerror = (error) => {
  console.error("Worker error:", error);
  searchResult.set([]);
  searchStatus.set("Error occurred during search");
  isSearching.set(false);
};

Browser.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  if (message.action === ACTION.UPDATE_VECTORS) {
    await loadBookmarks();
  }
});

export async function loadBookmarks() {
  if (!textEmbedder.isLoaded) {
    await textEmbedder.initialize({
      onProgress: (progress: any) => {},
    });
  }
  const urlKeys = await getAllUrlKeys();

  const bookmarkData = await getDataByUrlKeys(urlKeys);
  if (!bookmarkData) {
    return;
  }
  bookmarks.set(bookmarkData);
}

export async function getDataByUrlKeys(urls: string[]): Promise<any[] | null> {
  if (urls.length === 0) return null;

  return Promise.all(
    urls.map(async (url) => {
      const data = await Browser.storage.local.get(urls);
      return data[url];
    })
  );
}

export async function getAllUrlKeys(): Promise<string[]> {
  const allData = await Browser.storage.local.get();
  const urlRegex = /^https?:\/\/[^\s/$.?#].[^\s]*$/;

  return Object.keys(allData).filter((key) => urlRegex.test(key));
}

export async function searchBookmarks(query: string) {
  isSearching.set(true);
  modelProgress.set(0);
  searchStatus.set("Starting search...");

  // Send the search task to the worker
  searchWorker.postMessage({
    query,
    bookmarks: get(bookmarks),
    category: get(activeCategory),
  });
}

// Cleanup function to terminate the worker when needed
export function cleanupSearchWorker() {
  searchWorker.terminate();
}
