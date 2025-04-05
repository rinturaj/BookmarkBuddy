import Browser from "webextension-polyfill";

export async function createFolder(parentId: string, title: string) {
  const y = await Browser.bookmarks.create({
    parentId: parentId,
    title: title,
  });
}

async function createDefaultCategories(id: string | undefined) {
  const bookmarkFolders: string[] = [
    "📂 Work & Productivity",
    "📚 Learning & Research",
    "📰 News & Updates",
    "🎬 Entertainment & Leisure",
    "🛒 Shopping & Deals",
    "📱 Social Media & Networking",
    "💰 Finance & Banking",
    "🛠️ Tools & Utilities",
  ];

  const folders = await bookmarkFolders.map(async (x) => {
    const y = createFolder(id || "", x);
    return y;
  });

  return folders;
}
// Function to find a folder by title
function findFolder(
  node: Browser.Bookmarks.BookmarkTreeNode,
  title: string
): Browser.Bookmarks.BookmarkTreeNode | null {
  if (node.title === title && node.children) {
    return node;
  }
  if (node.children) {
    for (let child of node.children) {
      let found: any = findFolder(child, title);
      if (found) return found;
    }
  }
  return null;
}
export async function getCategory(): Promise<{
  parentId: string | undefined;
  folders: Browser.Bookmarks.BookmarkTreeNode[];
}> {
  // Get all bookmarks
  let bookmarks = await Browser.bookmarks.getTree();

  // Look for "BookmarkBuddy" folder
  let bookmarkBuddy = findFolder(bookmarks[0], "BookmarkBuddy");

  if (!bookmarkBuddy && !!bookmarks[0].children) {
    bookmarkBuddy = await Browser.bookmarks.create({
      parentId: undefined,
      title: "BookmarkBuddy",
    });
  }

  // Get all subfolders under "BookmarkBuddy"
  let children = await Browser.bookmarks.getChildren(bookmarkBuddy?.id || "");
  let folders = children.filter((item) => !!item);

  console.log(folders);

  if (folders.length <= 0) {
    await createDefaultCategories(bookmarkBuddy?.id);
    children = await Browser.bookmarks.getChildren(bookmarkBuddy?.id || "");
    folders = children.filter((item) => !!item);
  }

  return { parentId: bookmarkBuddy?.id, folders: folders.reverse() };
}
export function saveBookmark(url: string, contents: string) {}

export async function createBookmarkStructure(url: string, title: any) {
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
export async function getOrCreateFolder(
  title: any,
  parentId: string | undefined
) {
  let results = await Browser.bookmarks.search({ title });
  let folder = results.find((b) => !b.url && b.parentId === parentId);
  console.log();

  if (folder) return folder; // Folder exists

  return Browser.bookmarks.create({ parentId, title });
}
// Listen for messages from the popup
// chrome.runtime.onMessage.addListener((message) => {
//   if (message.action === "addBookmark") {
//     createBookmarkStructure(message.url, message.title);
//   }
// });

export async function getCurrenttab() {
  const tab = await Browser.tabs.query({ active: true, currentWindow: true });
  console.log(tab);

  return tab[0];
}
