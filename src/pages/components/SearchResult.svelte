<script lang="ts">
  import { ChevronRight, ChevronDown, X } from "lucide-svelte";
  // Import shadcn-svelte components
  import { Card, CardContent } from "$lib/components/ui/card";
  import { getFaviconFromUrl } from "../../script/bookmark.util";
  import Badge from "../../lib/components/ui/badge/badge.svelte";
  import Browser from "webextension-polyfill";
  import BookmarkCard from "./BookmarkCard.svelte";
  import {
    activeCategory,
    isSearching,
    modelProgress,
    searchResult,
    searchStatus,
  } from "../../script/bookmarkStore";
  import { Button } from "$lib/components/ui/button";
  import { trackEvent } from "../../script/analytics";
  import Spinner from "../../components/Spinner.svelte";
  import { fly } from "svelte/transition";
  import { quintInOut } from "svelte/easing";
  import Separator from "../../lib/components/ui/separator/separator.svelte";

  $: saved = searchResult;
  $: searchstts = searchStatus;
  $: activeC = activeCategory;

  async function toggleExpand(v: any, index: number) {
    console.log("toggle");
    // Get the current value of the store
    const currentItems = $saved;

    // Find the item to update
    const updatedItems = currentItems.map((item) => {
      if (item.id === v.id) {
        return { ...item, expanded: !item.expanded };
      } else {
        return { ...item, expanded: false };
      }
    });

    // Update the store with the new items
    searchResult.set(updatedItems);
    trackEvent("button_click", {
      button_id: "view_bookmark",
      button_name: "View Bookmark",
      button_text: "View Bookmark",
    });

    // If the item is now expanded, fetch its content
    if (updatedItems.find((item) => item.id === v.id)?.expanded) {
      const content = await Browser.storage.local.get(v.url);
      const updatedItemsWithContent = updatedItems.map((item) => {
        if (item.id === v.id) {
          return {
            ...item,
            content: content[v.url.toString()],
          };
        }
        return item;
      });

      // Update the store with the content
      searchResult.set(updatedItemsWithContent);
    }
  }

  function clearSearch() {
    searchResult.set([]);
  }
</script>

<div class="px-2 min-h-[100px]">
  {#if $saved.length !== 0}
    <div class="flex items-center justify-between mb-2">
      <div class="flex">
        <h4 class="text-lg font-semibold">Search Result</h4>
        <span class="mx-2">
          {#if $isSearching}
            <Spinner />
          {/if}
        </span>
        <!-- <small>{$searchStatus}</small> -->
      </div>

      <Button variant="ghost" size="sm" onclick={clearSearch}>
        <X class=" h-4" />
        Clear
      </Button>
    </div>
  {/if}

  <!-- {:else} -->
  {#if $saved.length === 0}
    <div class="flex flex-col items-center justify-center p-6 text-center">
      <img
        src="https://cdn-icons-png.flaticon.com/512/1828/1828884.png"
        class="w-12 h-12 mb-4 opacity-70"
        alt=""
        srcset=""
        onerror={(event) => {
          const img = event.target as HTMLImageElement;
          if (img) img.src = "/default.png";
        }}
      />
      <h1 class="text-sm font-semibold mb-2">
        {$searchstts}
        {$searchstts == "Search completed" && $saved.length === 0
          ? "but no results found"
          : ""}
      </h1>
      <Separator class="border border-primary/10"></Separator>
      {#if $activeC === ""}
        <h3 class="text-lg mt-1 font-semibold mb-2">Discover Your Bookmarks</h3>
      {:else}
        <h3 class="text-lg mt-1 font-semibold mb-2">
          No Bookmarks in <span
            class="bg-primary/10 text-primary px-2 py-1 rounded-md"
            >{$activeC}</span
          >
        </h3>
      {/if}

      <p class="text-sm text-muted-foreground mb-4">
        Try searching with natural language to find exactly what you need
      </p>

      {#if $isSearching}
        <div
          class="search-status"
          in:fly={{ y: 20, duration: 400, easing: quintInOut }}
        >
          {#if $modelProgress < 100}
            <div class="progress">
              Please wailt while we are loading model: {$modelProgress}%
            </div>
          {/if}
        </div>
      {/if}

      <div class="space-y-2 w-full max-w-md">
        <p class="text-xs text-muted-foreground">Try searching for:</p>
        <div class="flex flex-wrap gap-2 justify-center">
          <span class="text-xs px-2 py-1 bg-muted rounded-full"
            >"React tutorials from last month"</span
          >
          <span class="text-xs px-2 py-1 bg-muted rounded-full"
            >"AI research papers"</span
          >
          <span class="text-xs px-2 py-1 bg-muted rounded-full"
            >"Design inspiration websites"</span
          >
          <span class="text-xs px-2 py-1 bg-muted rounded-full"
            >"Productivity tools"</span
          >
        </div>
      </div>

      <p class="text-xs text-muted-foreground mt-4">
        Our AI understands context and meaning, not just keywords
      </p>
    </div>
  {/if}
  {#each $saved as item, index}
    <div
      class="mb-2"
      in:fly={{ x: 100, duration: 400, delay: index * 100, easing: quintInOut }}
      out:fly={{
        x: -100,
        duration: 400,
        delay: index * 100,
        easing: quintInOut,
      }}
    >
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
                onerror={(event) => {
                  const img = event.target as HTMLImageElement;
                  if (img) img.src = "/default.png";
                }}
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
              class="pl-4 pr-4 py-2 text-muted-foreground border-l-2 border-muted ml-3"
            >
              <Badge variant="secondary">{item.category}</Badge>
              <BookmarkCard bookmarkDetails={item.content}></BookmarkCard>
            </div>
          {/if}
        </CardContent>
      </Card>
    </div>
  {/each}
</div>
