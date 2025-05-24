import Browser from "webextension-polyfill";
export const bookmarkFolders: string[] = [
  "Productivity",
  "Research",
  "Newss",
  "Entertainment",
  "Shopping",
  "SocialMedia",
  "Finance",
  "Tools",
  "Utilities",
];
export function getFaviconFromUrl(url: string): string {
  try {
    const domain = new URL(url).origin;
    return `${domain}/favicon.ico`;
  } catch (error) {
    return "data:image/x-icon;";
  }
}
export async function createFolder(parentId: string, title: string) {
  const y = await Browser.bookmarks.create({
    parentId: parentId,
    title: title,
  });
}

async function createDefaultCategories(id: string | undefined) {
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
  let bookmarks = await Browser.bookmarks.getTree();

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

  if (folders.length <= 0) {
    await createDefaultCategories(bookmarkBuddy?.id);
    children = await Browser.bookmarks.getChildren(bookmarkBuddy?.id || "");
    folders = children.filter((item) => !!item);
  }

  return { parentId: bookmarkBuddy?.id, folders: folders.reverse() };
}

export async function bookmarkUrl(url: string, title: any, category: string) {
  let bookmarks = await Browser.bookmarks.getTree();

  let bookmarkBuddy = findFolder(bookmarks[0], "BookmarkBuddy");

  // Find or create Categories folder inside BookmarkBuddy
  let categoriesFolder: any = await getOrCreateFolder(
    category,
    bookmarkBuddy?.id
  );

  // Find or create the domain folder inside Categories
  // let domainFolder: any = await getOrCreateFolder(domain, categoriesFolder.id);

  // Create bookmark inside the domain folder
  let status = await Browser.bookmarks.create({
    parentId: categoriesFolder.id,
    title: title,
    url: url,
  });

  return status;
}

// Function to find or create a folder
export async function getOrCreateFolder(
  title: string,
  parentId: string | undefined
) {
  // Get all children of the parent folder
  if (!parentId) parentId = "1"; // fallback to Bookmarks Bar
  const children = await Browser.bookmarks.getChildren(parentId);
  const folder = children.find((child) => !child.url && child.title === title);
  if (folder) return folder; // Folder exists under parent

  // Only create if not found under parent
  return Browser.bookmarks.create({ parentId, title });
}

export async function getCurrenttab() {
  const tab = await Browser.tabs.query({ active: true, currentWindow: true });
  return tab[0];
}

export async function getBookmarks() {
  let cFolder = await getCategory();
  // Create an array to hold all subfolders
  let allSubfolders = await Promise.all(
    cFolder.folders.map(async (folder) => {
      // Get children of each category folder
      let subfolders = await Browser.bookmarks.getChildren(folder.id);
      return subfolders.map((x) => {
        // let child = await Browser.bookmarks.getChildren(x.id);
        return {
          ...x,
          ...{ category: folder.title },
          ...{ expanded: false },
        };
      });
    })
  );
  // Flatten the array of subfolders
  return allSubfolders.flat();
}
export async function getRecentBookmarks(
  limit: number = 10
): Promise<Browser.Bookmarks.BookmarkTreeNode[]> {
  const recentBookmarks = await Browser.bookmarks.getRecent(limit);
  return recentBookmarks;
}

export async function getAllUrlKeys(): Promise<string[]> {
  const allData = await Browser.storage.local.get();
  const urlRegex = /^https?:\/\/[^\s/$.?#].[^\s]*$/;

  return Object.keys(allData).filter((key) => urlRegex.test(key));
}

// export async function getDataByUrlKeys(
//   urls: string[]
// ): Promise<Record<string, any>> {
//   if (urls.length === 0) return {};

//   const data = await Browser.storage.local.get(urls);
//   return data;
// }
