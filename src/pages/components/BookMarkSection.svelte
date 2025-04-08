<script lang="ts">
  import {
    ChevronRight,
    ChevronDown,
    Bookmark,
    PlusIcon,
    Check,
    List,
    BookOpen,
    ExternalLink,
  } from "lucide-svelte";
  import * as Dialog from "$lib/components/ui/dialog/index";
  // Import shadcn-svelte components
  import { Button } from "$lib/components/ui/button";
  import { Card, CardContent } from "$lib/components/ui/card";
  import ScrollArea from "../../lib/components/ui/scroll-area/scroll-area.svelte";
  import Input from "../../lib/components/ui/input/input.svelte";
  import {
    createFolder,
    getBookmarks,
    getCategory,
    getFaviconFromUrl,
    getRecentBookmarks,
  } from "../../script/bookmark.util";
  import { onMount } from "svelte";
  import Badge from "../../lib/components/ui/badge/badge.svelte";
  import { ACTION } from "../../const";
  import Browser from "webextension-polyfill";
  import BookmarkCard from "./BookmarkCard.svelte";

  let viewInput = false;
  let parentFolderId = "";
  let categories: any[] = [];
  let saved: any[] = [];

  onMount(async () => {
    let bookmarkBuddyFolder: any = await getCategory();
    categories = bookmarkBuddyFolder.folders;
    parentFolderId = bookmarkBuddyFolder.parentId;
    saved = await getBookmarks();
    recents = await getRecentBookmarks(5);
    console.log(saved);
  });

  // Sample data for bookmarks
  let recents: any[] = [];

  let activeCategory: any = null;

  Browser.runtime.onMessage.addListener(async (message) => {
    if (message.action === ACTION.UPDATE_TABS) {
      saved = await getBookmarks();
      recents = await getRecentBookmarks(5);
    }
  });

  async function toggleExpand(item: any, index: number) {
    console.log("toggle");

    saved[index].expanded = !item.expanded;
    saved[index].content = await Browser.storage.local.get(item.url);
    saved[index].content = saved[index].content[item.url.toString()];
  }

  function removeBookmark() {}

  // Capture selected content

  // Clear captured content

  // Icon components mapping
  // Save current tab as bookmark
  function saveCurrentTab() {
    // In a real extension, this would interact with the Chrome API
    // For now, we'll just add a dummy entry to recents
    recents.unshift({
      url: "new-bookmark.com",
      title: "New Bookmark",
      expanded: false,
    });
    recents = recents; // Trigger reactivity
  }
  let addCategory = true;
  let categoryname = "";
  let listCategory = false;

  export let imageUrl =
    "https://cdn-icons-png.flaticon.com/512/1828/1828884.png"; // Bookmark icon or 'no bookmarks' illustration
</script>

<!-- Bookmarks -->
<div class="px-4 mb-4 flex items-center justify-between">
  <div class="flex items-center gap-2">
    <Bookmark class="w-6 h-6" />
    <h2 class="text-xl font-bold">Bookmarks</h2>
  </div>
  <div>
    <Button
      onclick={() => {
        listCategory = !listCategory;
      }}
      variant="ghost"
      size="icon"
    >
      <List></List>
    </Button>
  </div>
</div>
<Dialog.Root open={viewInput} onOpenChange={(x) => (viewInput = x)}>
  <Dialog.Content class="sm:max-w-[425px] ">
    <Dialog.Header>
      <Dialog.Title>Add Category</Dialog.Title>
      <Dialog.Description>
        Creating a new category will help you organize your bookmarks more
        effectively.
      </Dialog.Description>
    </Dialog.Header>
    <Input id="name" bind:value={categoryname} class="col-span-" />
    <p class="text-red-500">
      {categories.findIndex((x) => x.title === categoryname) >= 0
        ? "Category already existing"
        : ""}
    </p>
    <Dialog.Footer>
      <Button
        onclick={async () => {
          createFolder(parentFolderId, categoryname);
          categoryname = "";
          let bookmarkBuddyFolder: any = await getCategory();
          categories = bookmarkBuddyFolder.folders;
          parentFolderId = bookmarkBuddyFolder.parentId;
          viewInput = false;
        }}
        disabled={categories.findIndex((x) => x.title === categoryname) >= 0 ||
          categoryname == ""}
        type="button">Save changes</Button
      >
    </Dialog.Footer>
  </Dialog.Content>
</Dialog.Root>
<!-- Recents -->
<div class="flex-1">
  <ScrollArea class="whitespace-nowrap px-2 pb-2 " orientation="horizontal">
    <div class="flex {listCategory ? 'flex-wrap  ' : ''} space-x-1">
      <Button
        class="flex-nowrap"
        variant="ghost"
        size="icon"
        onclick={() => {
          viewInput = !viewInput;
        }}
      >
        {#if !viewInput}
          <PlusIcon></PlusIcon>
        {:else}
          <Check></Check>
        {/if}
      </Button>

      {#each categories as category}
        <Button
          class="m-1"
          variant={activeCategory === category.id ? "default" : "outline"}
          size="sm"
        >
          {category.title}
        </Button>
      {/each}
    </div>
  </ScrollArea>
  {#if recents.length > 0}
    <div class="px-2 mb-2">
      <h3 class="text-lg font-semibold mb-2">Recents</h3>

      {#each recents as item, index}
        <div class="mb-2">
          <Card class="p-0">
            <CardContent class="p-0">
              <button
                class="w-full hover:bg-muted cursor-pointer rounded-lg flex items-center justify-between p-2 flex-grow min-w-0 text-left"
                onclick={() => toggleExpand(item, index)}
              >
                <div class="flex items-center gap-2 flex-grow min-w-0">
                  <img
                    src={getFaviconFromUrl(item?.url)}
                    class="h-[24px]"
                    alt=""
                    srcset=""
                  />
                  <div class="flex flex-col flex-grow min-w-0">
                    <span
                      class="text-sm font-medium font-medium truncate flex-grow min-w-0"
                      >{item?.title || item?.url}</span
                    >
                    <!-- <span
                      class="text-xs truncate max-w-[250px] text-muted-foreground"
                      >{item?.url}</span
                    > -->
                  </div>
                </div>
                <ExternalLink
                  class="w-5 h-5 flex-shrink-0 text-muted-foreground"
                />
              </button>
            </CardContent>
          </Card>
        </div>
      {/each}
    </div>
  {/if}
  <!-- Saved -->
  <div class="px-2">
    <h3 class="text-lg font-semibold mb-2">Saved</h3>

    {#if saved.length === 0}
      <div class="flex flex-col items-center justify-center p-6 text-center">
        <img
          src={imageUrl}
          alt="No data found"
          class="w-12 h-12 mb-4 opacity-70"
        />
        <p class="text-lg font-medium text-gray-600">No Bookmarks</p>
        <p>
          No worries! Our AI Assistant is here to help you save and organize
          your bookmarks with ease!
        </p>
      </div>
    {/if}

    {#each saved as item, index}
      <div class="mb-2">
        <Card class="p-0">
          <CardContent class="p-0">
            <button
              class="w-full hover:bg-muted cursor-pointer rounded-lg flex items-center flex-grow min-w-0 justify-between p-2 text-left"
              onclick={() => toggleExpand(item, index)}
            >
              <div class="flex items-center flex-grow min-w-0 gap-2">
                <img
                  src={getFaviconFromUrl(item?.url)}
                  class="h-[24px]"
                  alt=""
                  srcset=""
                />
                <div class="flex flex-col flex-grow min-w-0">
                  <span class="text-sm font-medium truncate flex-grow min-w-0"
                    >{item.title || item.url}</span
                  >
                  <span
                    class="text-xs truncate flex-grow min-w-0 text-muted-foreground"
                    >{item.url}</span
                  >
                </div>
              </div>
              <div class="flex items-center flex-shrink-0">
                {#if item.expanded}
                  <ChevronDown class="w-5 h-5 text-muted-foreground" />
                {:else}
                  <ChevronRight class="w-5 h-5 text-muted-foreground" />
                {/if}
              </div>
            </button>

            {#if item.expanded}
              <div
                class="pl-8 pr-4 py-2 text-sm text-muted-foreground border-l-2 border-muted ml-3"
              >
                <Badge variant="secondary">{item.category}</Badge>
                <BookmarkCard {removeBookmark} bookmarkDetails={item.content}
                ></BookmarkCard>
              </div>
            {/if}
          </CardContent>
        </Card>
      </div>
    {/each}
  </div>
</div>
