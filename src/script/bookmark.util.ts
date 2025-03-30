import Browser from "webextension-polyfill";

async function createBookmarkStructure(url: string, title: any) {
  const domain = new URL(url).hostname;

  // Find or create BookmarkBuddy folder
  let bookmarkBuddyFolder: any = await getOrCreateFolder(
    "BookmarkBuddy",
    undefined
  );

  // Find or create Categories folder inside BookmarkBuddy
  let categoriesFolder: any = await getOrCreateFolder(
    "Categories",
    bookmarkBuddyFolder.id
  );

  // Find or create the domain folder inside Categories
  let domainFolder: any = await getOrCreateFolder(domain, categoriesFolder.id);

  // Create bookmark inside the domain folder
  let status = await Browser.bookmarks.create({
    parentId: domainFolder.id,
    title: title,
    url: url,
  });

  return status;
}

// Function to find or create a folder
async function getOrCreateFolder(title: any, parentId: string | undefined) {
  let results = await Browser.bookmarks.search({ title });
  let folder = results.find((b) => !b.url && b.parentId === parentId);

  if (folder) return folder; // Folder exists

  return Browser.bookmarks.create({ parentId, title });
}
// Listen for messages from the popup
chrome.runtime.onMessage.addListener((message) => {
  if (message.action === "addBookmark") {
    createBookmarkStructure(message.url, message.title);
  }
});
