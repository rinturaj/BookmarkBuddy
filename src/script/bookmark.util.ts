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

// async function createDefaultCategories(id: string | undefined) {
//   const folders = await bookmarkFolders.map(async (x) => {
//     const y = createFolder(id || "", x);
//     return y;
//   });

//   return folders;
// }
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
  // Get all subfolders under "BookmarkBuddy"
  let children = await Browser.bookmarks.getChildren("1");
  let folders = children.filter((item) => !!item);

  // if (folders.length <= 0) {
  //   // await createDefaultCategories(bookmarkBuddy?.id);
  //   children = await Browser.bookmarks.getChildren("1");
  //   folders = children.filter((item) => !!item);
  // }

  return { parentId: "1", folders: folders.reverse() };
}

export async function bookmarkUrl(url: string, title: any, category: string) {
  let bookmarks = await Browser.bookmarks.getTree();

  let bookmarkBuddy = findFolder(bookmarks[0], "BookmarkBuddy");

  // Find or create Categories folder inside BookmarkBuddy
  let categoriesFolder: any = await getOrCreateFolder(category, "1");

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

export async function mergeDuplicateFolders() {
  try {
    const rootId = "1"; // Bookmarks Bar
    const children = await Browser.bookmarks.getChildren(rootId);
    
    // Group folders by normalized title
    const folderMap = new Map<string, Browser.Bookmarks.BookmarkTreeNode[]>();
    
    for (const child of children) {
      if (!child.url) { // It's a folder
        const normalizedTitle = child.title.trim().toLowerCase();
        if (!folderMap.has(normalizedTitle)) {
          folderMap.set(normalizedTitle, []);
        }
        folderMap.get(normalizedTitle)?.push(child);
      }
    }

    // Merge duplicates
    for (const [title, folders] of folderMap.entries()) {
      if (folders.length > 1) {
        // Sort by ID to keep the oldest or specifically choose one. 
        // Usually keeping the first one found (oldest) is safe.
        const targetFolder = folders[0];
        const duplicates = folders.slice(1);

        for (const duplicate of duplicates) {
          // Move all children of duplicate to target
          const subChildren = await Browser.bookmarks.getChildren(duplicate.id);
          for (const subChild of subChildren) {
             await Browser.bookmarks.move(subChild.id, { parentId: targetFolder.id });
          }
          // Remove the empty duplicate folder
          await Browser.bookmarks.remove(duplicate.id);
        }
      }
    }

    // After merging, remove any folders that might be empty
    await removeEmptyFolders();

  } catch (error) {
    console.error("Error merging duplicate folders:", error);
  }
}

export async function removeEmptyFolders() {
  try {
     const rootId = "1";
     const tree = await Browser.bookmarks.getSubTree(rootId);
     if (tree && tree.length > 0) {
        await removeEmptyRecursive(tree[0]);
     }
  } catch (e) {
      console.error("Error removing empty folders", e);
  }
}

async function removeEmptyRecursive(node: Browser.Bookmarks.BookmarkTreeNode) {
    if (node.children) {
        // Process children first (depth-first)
        for (const child of node.children) {
            await removeEmptyRecursive(child);
        }
        
        // Re-fetch node/children to check if empty after processing descendants
        // Note: 'node' here is stale, but we can check if it HAD children and if we deleted them?
        // Actually, better to check current state. But 'node' is a snapshot.
        // It's safer to just operate on what we knew was a folder.
        // If it's a folder (no URL) and not the root (id "1" or "0"), check if we should delete.
    }
    
    // Check if this node itself should be deleted
    // We can't delete root folders "0", "1", '2' etc. usually.
    if (!node.url && node.id !== "0" && node.id !== "1" && node.id !== "2") {
        // Fetch fresh to see if it's truly empty now
        try {
            const children = await Browser.bookmarks.getChildren(node.id);
            if (children.length === 0) {
                await Browser.bookmarks.remove(node.id);
            }
        } catch (e) {
            // Node might have been deleted or invalid
        }
    }
}


