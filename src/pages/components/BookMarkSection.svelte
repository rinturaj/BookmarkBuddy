<script lang="ts">
  import SearchResult from "./SearchResult.svelte";

  import { Bookmark, PlusIcon, Check, List, ExternalLink } from "lucide-svelte";
  import * as Dialog from "$lib/components/ui/dialog/index";
  // Import shadcn-svelte components
  import { Button } from "$lib/components/ui/button";
  import { Card, CardContent } from "$lib/components/ui/card";
  import ScrollArea from "../../lib/components/ui/scroll-area/scroll-area.svelte";
  import Input from "../../lib/components/ui/input/input.svelte";
  import {
    createFolder,
    getCategory,
    getFaviconFromUrl,
    getRecentBookmarks,
  } from "../../script/bookmark.util";
  import { onMount } from "svelte";
  import { ACTION } from "../../const";
  import Browser from "webextension-polyfill";
  import { searchResult } from "../../script/bookmarkStore";
  import Separator from "../../lib/components/ui/separator/separator.svelte";

  let viewInput = false;
  let parentFolderId = "";
  let categories: any[] = [];

  onMount(async () => {
    let bookmarkBuddyFolder: any = await getCategory();
    categories = bookmarkBuddyFolder.folders;
    parentFolderId = bookmarkBuddyFolder.parentId;
    recents = await getRecentBookmarks(5);
  });

  // Sample data for bookmarks
  let recents: any[] = [];

  let activeCategory: any = null;

  Browser.runtime.onMessage.addListener(async (message) => {
    if (message.action === ACTION.UPDATE_TABS) {
      recents = await getRecentBookmarks(5);
    }
  });

  let categoryname = "";
  let listCategory = false;
</script>

<div class="px-2 mb-2 flex items-center justify-between">
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

<!-- Recents -->
<div class="flex-1">
  <ScrollArea class="whitespace-nowrap px-1 pb-1 " orientation="horizontal">
    <div class="flex {listCategory ? 'flex-wrap  ' : ''} space-x-1">
      <Button
        class="flex-nowrap"
        variant="ghost"
        size="sm"
        onclick={() => {
          viewInput = !viewInput;
        }}
      >
        {#if !viewInput}
          <PlusIcon class="w-4 h-4"></PlusIcon>
        {:else}
          <Check class="w-4 h-4"></Check>
        {/if}
      </Button>

      {#each categories as category}
        <Button
          class="m-1 p-1 py-1 h-8 text-xs"
          variant={activeCategory === category.id ? "default" : "outline"}
          size="sm"
        >
          {category.title}
        </Button>
      {/each}
    </div>
  </ScrollArea>

  <!-- Saved -->
  <SearchResult></SearchResult>
  {#if recents.length > 0}
    <Separator></Separator>

    <div class="px-2 mb-2">
      <h4 class="text-lg font-semibold mb-2">Recently Saved Bookmark</h4>

      {#each recents as item, index}
        <div class="mb-2">
          <Card class="p-0">
            <CardContent class="p-0">
              <button
                class="w-full hover:bg-muted cursor-pointer rounded-lg flex items-center justify-between p-2 flex-grow min-w-0 text-left"
              >
                <div class="flex items-center gap-2 flex-grow min-w-0">
                  <img
                    src={getFaviconFromUrl(item?.url)}
                    class="h-[24px]"
                    alt=""
                    srcset=""
                  />
                  <div class="flex flex-col flex-grow min-w-0">
                    <span class="text-sm font-medium truncate flex-grow min-w-0"
                      >{item?.title || item?.url}</span
                    >
                    <span
                      class="text-xs truncate max-w-[250px] text-muted-foreground"
                    >
                      {item?.url}</span
                    >
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
