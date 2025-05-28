<script lang="ts">
  import recentlyBookmarked from "./RecentlyBookmarked.svelte";

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
  import {
    activeCategory,
    searchBookmarks,
    searchResult,
  } from "../../script/bookmarkStore";
  import Separator from "../../lib/components/ui/separator/separator.svelte";
  import { get } from "svelte/store";
  import { flyScaleFade } from "../../script/animation";
  import { quintInOut } from "svelte/easing";
  import RecentlyBookmarked from "./RecentlyBookmarked.svelte";

  let viewInput = false;
  let parentFolderId = "";
  let categories: any[] = [];

  onMount(async () => {
    let bookmarkBuddyFolder: any = await getCategory();
    categories = bookmarkBuddyFolder.folders;
    parentFolderId = bookmarkBuddyFolder.parentId;
    recents = await getRecentBookmarks(5);
    activeCategory.set("");
  });

  // Sample data for bookmarks
  let recents: any[] = [];

  $: activeC = activeCategory;

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

      {#each categories as category, index}
        <div
          class="m-1"
          in:flyScaleFade={{
            delay: index * 500,
            duration: 350,
            easing: quintInOut,
          }}
        >
          <Button
            onclick={() => {
              if (get(activeCategory) == category.title) {
                activeCategory.set("");
              } else {
                activeCategory.set(category.title);
              }
              searchBookmarks("");
            }}
            class=" p-1 py-1 h-8 text-xs"
            variant={$activeC === category.title ? "default" : "outline"}
            size="sm"
          >
            {category.title}
          </Button>
        </div>
      {/each}
    </div>
  </ScrollArea>

  <!-- Saved -->
  <SearchResult></SearchResult>
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
