<script lang="ts">
  import {
    ChevronRight,
    ChevronDown,
    Bookmark,
    Folder,
    Plus,
    PlusIcon,
    Check,
    ListFilter,
    List,
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
    getOrCreateFolder,
  } from "../../script/bookmark.util";
  import { onMount } from "svelte";
  import Badge from "../../lib/components/ui/badge/badge.svelte";

  let viewInput = false;
  let parentFolderId = "";
  let categories: any[] = [];
  let saved: any[] = [];

  onMount(async () => {
    let bookmarkBuddyFolder: any = await getCategory();
    categories = bookmarkBuddyFolder.folders;
    parentFolderId = bookmarkBuddyFolder.parentId;
    saved = await getBookmarks();
    console.log(saved);
  });
  // Sample data for suggestions

  // Sample data for bookmarks
  let recents = [{ url: "com.github.com", title: "GitHub", expanded: false }];

  let activeCategory: any = null;
  // Find or create BookmarkBuddy folder

  // Sample captured content

  // Sample AI analysis

  // Sample user notes

  // Toggle expansion of bookmark items
  function toggleExpand(item: any) {
    console.log("toggle");

    item.expanded = !item.expanded;
  }

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
  <div class="px-2 mb-2">
    <h3 class="text-lg font-semibold mb-2">Recents</h3>

    {#each recents as item}
      <div class="mb-2">
        <Card class="p-0">
          <CardContent class="p-0">
            <button
              class="w-full flex items-center justify-between p-2 text-left"
              onclick={() => toggleExpand(item)}
            >
              <div class="flex items-center gap-2">
                <Folder class="w-5 h-5 text-muted-foreground" />
                <div class="flex flex-col">
                  <span class="text-sm font-medium"
                    >{item?.title || item?.url}</span
                  >
                  <span class="text-xs text-muted-foreground">{item?.url}</span>
                </div>
              </div>
              <ChevronRight class="w-5 h-5 text-muted-foreground" />
            </button>
          </CardContent>
        </Card>
      </div>
    {/each}
  </div>

  <!-- Saved -->
  <div class="px-2">
    <h3 class="text-lg font-semibold mb-2">Saved</h3>

    {#each saved as item}
      <div class="mb-2">
        <Card class="p-0">
          <CardContent class="p-0">
            <button
              class="w-full flex items-center justify-between p-2 text-left"
              onclick={() => toggleExpand(item)}
            >
              <div class="flex items-center gap-2">
                <Folder class="w-5 h-5 text-muted-foreground" />
                <div class="flex flex-col">
                  <span class="text-sm font-medium"
                    >{item.title || item.url}</span
                  >
                  <span class="text-xs text-muted-foreground">{item.url}</span>
                </div>
              </div>
              {#if item.expanded}
                <ChevronDown class="w-5 h-5 text-muted-foreground" />
              {:else}
                <ChevronRight class="w-5 h-5 text-muted-foreground" />
              {/if}
            </button>

            {#if item.expanded && item.content}
              <div
                class="pl-8 pr-4 py-2 text-sm text-muted-foreground border-l-2 border-muted ml-3"
              >
                {item.content}
              </div>
            {/if}
          </CardContent>
        </Card>
      </div>
    {/each}
  </div>
</div>
