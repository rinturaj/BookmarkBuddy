<script lang="ts">
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

{#if recents.length > 0}
  <Separator></Separator>

  <div class="px-4 mb-4">
    <h2 class="text-lg font-semibold mb-2">Recently Saved Bookmark</h2>
    {#each recents as item, index}
      <div class="mb-2">
        <Card class="p-0">
          <CardContent class="p-0">
            <a
              href={item?.url}
              target="_blank"
              class="w-full hover:bg-muted cursor-pointer rounded-lg flex items-center justify-between p-2 flex-grow min-w-0 text-left"
            >
              <div class="flex items-center gap-2 flex-grow min-w-0">
                <img
                  src={getFaviconFromUrl(item?.url)}
                  class="h-[24px]"
                  alt=""
                  srcset=""
                  onerror={(event) => {
                    const img = event.target as HTMLImageElement;
                    if (img) img.src = "/default.png";
                  }}
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
            </a>
          </CardContent>
        </Card>
      </div>
    {/each}
  </div>
{/if}
