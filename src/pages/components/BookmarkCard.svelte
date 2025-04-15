<script lang="ts">
  import { ExternalLink, Trash2, Check } from "lucide-svelte";
  import { fly, scale, fade } from "svelte/transition";
  import { quintInOut, quintOut } from "svelte/easing";
  import Button from "../../lib/components/ui/button/button.svelte";
  import { getFaviconFromUrl } from "../../script/bookmark.util";
  import Separator from "../../lib/components/ui/separator/separator.svelte";

  // Custom transition combining fly, scale, and fade
  import { crossfade } from "svelte/transition";
  import type { TransitionConfig } from "svelte/transition";

  import browser from "webextension-polyfill";
  import { ACTION } from "../../const";
  import { trackEvent } from "../../script/analytics";
  import { searchResult } from "../../script/bookmarkStore";
  import { flyScaleFade } from "../../script/animation";

  interface BookmarkDetails {
    id?: string;
    url: string;
    title: string;
    details: string;
    links: string[];
    alternatives: string[];
  }

  export let bookmarkDetails: BookmarkDetails;
  let isDeleting = false;
  let isDeleted = false;

  async function removeBookmark() {
    isDeleting = true;
    try {
      // Remove from browser bookmarks
      if (bookmarkDetails?.id) {
        await browser.bookmarks.remove(bookmarkDetails.id);
      }

      // Remove from local storage
      await browser.storage.local.remove(bookmarkDetails?.url);

      // Remove from search results
      searchResult.update((items) =>
        items.filter((item) => item.url !== bookmarkDetails?.url)
      );

      // Notify other components
      await browser.runtime.sendMessage({ action: ACTION.UPDATE_TABS });
      await browser.runtime.sendMessage({ action: ACTION.UPDATE_VECTORS });

      // Track the event
      trackEvent("button_click", {
        button_id: "remove_bookmark_button",
        button_text: "Remove Bookmark",
      });

      isDeleted = true;
      // Wait for animation to complete before removing
    } catch (error) {
      console.error("Error removing bookmark:", error);
      isDeleting = false;
    }
  }
</script>

<div
  class="space-y-1"
  in:flyScaleFade={{ delay: 250, duration: 350, easing: quintInOut }}
  out:fly={{
    x: -100,
    duration: 400,
    delay: 100,
    easing: quintInOut,
  }}
  class:deleting={isDeleting}
>
  <div class="p-1 rounded-md relative overflow-hidden group">
    <div class="flex items-center justify-between">
      <h6
        class="border-b pb-2 text-xl font-semibold tracking-tight transition-colors first:mt-0"
        class:line-through={isDeleting}
      >
        {bookmarkDetails?.title}
      </h6>
      {#if isDeleting}
        <div class="flex items-center gap-1 text-green-600">
          <Check class="h-4 w-4" />
          <span class="text-sm font-medium">Deleted</span>
        </div>
      {/if}
    </div>
    <p class="leading-2" class:line-through={isDeleting}>
      {bookmarkDetails?.details}
    </p>

    <h6 class="text-sm font-semibold mt-2">Usefull links</h6>
    <ul class="ml-6 list-decimal [&>li]:mt-2">
      {#each bookmarkDetails?.links as links}
        <li>
          <a class="text-primary cursor-pointer" href={links} target="_blank"
            >{links}</a
          >
        </li>
      {/each}
    </ul>
    <h6 class="text-sm font-semibold mt-2">Similar Websites</h6>
    <ul class="ml-1 list-none [&>li]:mt-2">
      {#each bookmarkDetails?.alternatives as links}
        <li class="flex">
          <img
            src={getFaviconFromUrl(links)}
            class="h-[16px] mr-2"
            alt=""
            srcset=""
          />
          <a class="text-primary cursor-pointer" href={links} target="_blank">
            {links}</a
          >
        </li>
      {/each}
    </ul>
  </div>
  <div class="flex align-middle items-center justify-end gap-2">
    <!-- <span class="text-xs text-muted-foreground">
      {new Date(bookmarkDetails?.dateAdded).toDateString()}</span> -->

    <Separator orientation="vertical"></Separator>
    <Button
      variant="ghost"
      size="icon"
      href={bookmarkDetails?.url}
      target="_blank"
    >
      <ExternalLink class="h-3.5 w-3.5 text-primary" />
    </Button>
    <Button
      variant="ghost"
      size="icon"
      onclick={removeBookmark}
      class="hover:bg-red-100 dark:hover:bg-red-900/20"
    >
      <Trash2 class="h-3.5 w-3.5 text-red-600" />
    </Button>
  </div>
</div>

<style>
  .deleting {
    opacity: 0.5;
    pointer-events: none;
  }
  .line-through {
    text-decoration: line-through;
    color: var(--muted-foreground);
  }
</style>
