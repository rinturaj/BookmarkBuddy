<script lang="ts">
  import Browser from "webextension-polyfill";
  import { BookmarkCheck, TerminalIcon } from "lucide-svelte";
  import { Progress } from "$lib/components/ui/progress/index.js";
  import * as Card from "$lib/components/ui/card/index.js";
  import { fly } from "svelte/transition";
  import { quintInOut } from "svelte/easing";

  import { onMount } from "svelte";
  import { flyScaleFade } from "../../script/animation";
  import BookmarkCard from "../common/BookmarkCard.svelte";
  let floatingProgressList: any[] = [];
  let currentUrl = window.location.href;

  function filterForCurrentPage(list: any[]) {
    // Only show progress cards for this page's URL
    return list.filter((item) => item.url === currentUrl);
    // To show all active bookmarks globally, return list;
  }

  async function loadFloatingProgressList() {
    const { list = [] } = await Browser.storage.local.get(
      "floatingProgressList"
    );

    floatingProgressList = filterForCurrentPage(
      Array.isArray(list) ? list : []
    );
  }

  onMount(async () => {
    await loadFloatingProgressList();
    // Listen for storage changes to update in real time
    Browser.storage.onChanged.addListener(async (changes, area) => {
      if (area === "local" && changes.floatingProgressList) {
        floatingProgressList = filterForCurrentPage(
          changes.floatingProgressList.newValue ?? []
        );
      }
    });
  });
</script>

{#each floatingProgressList as entry (entry.url)}
  <div class="floating-progress-bar">
    <div
      class="m-2 p-3"
      in:flyScaleFade={{ delay: 250, duration: 350, easing: quintInOut }}
      out:fly={{
        x: -200,
        duration: 200,
        delay: 100,
        easing: quintInOut,
      }}
    >
      <Card.Root class="bord shadow-lg max-w-sm ">
        <Card.Header>
          {#if entry.status === "error"}
            <Card.Title
              class="text-sm font-extrabold font-sans text-red-600 flex items-center gap-2"
            >
              <TerminalIcon size={18} /> Bookmark Removed
            </Card.Title>
            <Card.Description class="text-sm max-w-xs">
              The bookmark was deleted before AI could finish. Bookmarking
              aborted.
            </Card.Description>
          {:else if entry.status === "done"}
            <Card.Title
              class="text-sm font-extrabold font-sans text-green-600 flex items-center gap-2"
            >
              <BookmarkCheck size={18} /> Bookmark Saved!
            </Card.Title>
            <Card.Description class="text-sm">
              Your page was successfully organized by AI. 🎉
            </Card.Description>
          {:else}
            <Card.Title class="text-sm font-extrabold font-sans">
              🚀 Bookmarking in Progress!
            </Card.Title>
            <Card.Description class="text-sm max-w-xs">
              Our AI is working its magic ✨ to save your page. Sit tight, this
              will be quick! ⏳
            </Card.Description>
          {/if}
        </Card.Header>
        <Card.Content>
          {#if entry.status === "error"}
            <div class="text-red-500 text-xs mt-2">AI bookmarking aborted.</div>
          {:else if entry.status === "done"}
            <div class="max-w-xs">
              <BookmarkCard bookmarkDetails={entry.bookmarkDetails} />
            </div>
          {:else}
            <Progress value={entry.progressValue} max={100} />
          {/if}
        </Card.Content>
      </Card.Root>
    </div>
  </div>
{/each}

<style>
  .floating-progress-bar {
    position: fixed;
    top: 24px;
    right: 24px;
    /* width: 240px; */
    min-width: 240px;
    /* height: 18px; */
    /* background: rgba(0, 0, 0, 0.15); */
    z-index: 2147483647;
    overflow: hidden;
  }
</style>
