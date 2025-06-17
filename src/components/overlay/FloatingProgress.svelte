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

<!-- <div
  class="fixed bottom-4 right-4 z-50 flex flex-col gap-2 bg-white p-4 rounded-lg shadow-lg border border-gray-200"
>
  <h3 class="font-bold text-sm mb-2">Test Floating Progress</h3>
  <div class="flex gap-2 flex-wrap">
    <button
      on:click={() => testProgressState("in-progress")}
      class="px-3 py-1.5 text-xs font-medium rounded bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors"
    >
      Test In Progress
    </button>
    <button
      on:click={() => testProgressState("done")}
      class="px-3 py-1.5 text-xs font-medium rounded bg-green-100 text-green-700 hover:bg-green-200 transition-colors"
    >
      Test Done
    </button>
    <button
      on:click={() => testProgressState("error")}
      class="px-3 py-1.5 text-xs font-medium rounded bg-red-100 text-red-700 hover:bg-red-200 transition-colors"
    >
      Test Error
    </button>
    <button
      on:click={() => (floatingProgressList = [])}
      class="px-3 py-1.5 text-xs font-medium rounded bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
    >
      Clear
    </button>
  </div>
</div> -->

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
      <div
        class="bg-white rounded-lg border border-gray-200 shadow-lg max-w-sm p-4"
      >
        <div class="space-y-2">
          {#if entry.status === "error"}
            <div
              class="text-sm font-extrabold font-sans text-red-600 flex items-center gap-2"
            >
              <TerminalIcon size={18} /> Bookmark Removed
            </div>
            <p class="text-gray-600 text-sm max-w-xs">
              The bookmark was deleted before AI could finish. Bookmarking
              aborted.
            </p>
          {:else if entry.status === "done"}
            <div
              class="text-sm font-extrabold font-sans text-green-600 flex items-center gap-2"
            >
              <BookmarkCheck size={18} /> Bookmark Saved!
            </div>
            <p class="text-gray-600 text-sm">
              Your page was successfully organized by AI. 🎉
            </p>
          {:else}
            <div class="text-sm font-extrabold font-sans text-gray-800">
              🚀 Bookmarking in Progress!
            </div>
            <p class="text-gray-600 text-sm max-w-xs">
              Our AI is working its magic ✨ to save your page. Sit tight, this
              will be quick! ⏳
            </p>
          {/if}
        </div>

        <div class="mt-4">
          {#if entry.status === "error"}
            <div class="text-red-500 text-xs">AI bookmarking aborted.</div>
          {:else if entry.status === "done"}
            <div class="max-w-xs">
              <BookmarkCard bookmarkDetails={entry.bookmarkDetails} />
            </div>
          {:else}
            <div class="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <div
                class="bg-emerald-500 h-full rounded-full transition-all duration-300 ease-in-out"
                style={`width: ${entry.progressValue}%`}
                role="progressbar"
                aria-valuenow={entry.progressValue}
                aria-valuemin="0"
                aria-valuemax="100"
              ></div>
            </div>
          {/if}
        </div>
      </div>
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
