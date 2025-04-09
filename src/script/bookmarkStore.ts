import { derived, writable } from "svelte/store";
import textEmbedder from "./textEmbedder";
import Browser from "webextension-polyfill";
import { ACTION } from "../const";

export const bookmarks = writable<any[]>([]);
export const searchResult = writable<any[]>([]);

Browser.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  if (message.action === ACTION.UPDATE_VECTORS) {
    console.log("Update vectors action received");
    await loadBookmarks();
  }
});

export async function loadBookmarks() {
  if (!textEmbedder.isLoaded) {
    await textEmbedder.initialize({
      onProgress: (progress: any) => {
        console.log(`Model loading progress: ${progress.progress * 100}%`);
      },
    });
  }

  // Get all URL keys
  const urlKeys = await getAllUrlKeys();

  // Get data for all URLs
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

export async function searchBookmarks(query: string, list: any[]) {
  const queryEmbedding = await callMiniLLm(query);
  const result = list
    .map((b) => ({
      ...b,
      score: textEmbedder.cosineSimilarity(queryEmbedding, b.embedding),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);
  searchResult.set(result);
  return result;
}

export async function callMiniLLm(text: any) {
  return await textEmbedder.embedText(text);
}
