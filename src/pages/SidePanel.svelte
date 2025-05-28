<script lang="ts">
  let showAiAnalysis = true;
  import { ModeWatcher } from "mode-watcher";
  import ActiveTabs from "../components/common/ActiveTabs.svelte";
  import SuggestionsSection from "../components/common/SuggestionsSection.svelte";
  import BookMarkSection from "../components/common/BookMarkSection.svelte";
  import * as Tabs from "$lib/components/ui/tabs";
  import Header from "../components/common/Header.svelte";
  import AiAnalysis from "../components/common/AiAnalysis.svelte";
  import SearchSection from "../components/common/SearchSection.svelte";
  import Browser from "webextension-polyfill";
  import { ACTION } from "../const";
  import { onMount } from "svelte";
  import { initAnalytics, trackPageView } from "../script/analytics";
  import RecentlyBookmarked from "../components/common/RecentlyBookmarked.svelte";

  onMount(() => {
    try {
      initAnalytics();
      trackPageView("sidepanel");
    } catch (error) {
      console.error("Error tracking page view:", error);
    }
  });
</script>

<ModeWatcher />

<div class={`flex flex-col h-full w-full  bg-background`}>
  <Header></Header>

  <button
    class="flex items-center gap-2 px-2 py-1 mb-1 text-sm font-medium rounded hover:bg-muted transition-colors"
    on:click={() => (showAiAnalysis = !showAiAnalysis)}
    aria-expanded={showAiAnalysis}
    aria-controls="ai-analysis-section"
    style="outline: none; border: none; background: none; cursor: pointer;"
  >
    <svg
      width="18"
      height="18"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style="transition: transform 0.3s; transform: rotate({showAiAnalysis
        ? 90
        : 0}deg);"
    >
      <path
        d="M6 8L10 12L14 8"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
    {showAiAnalysis ? "Hide AI Analysis" : "Show AI Analysis"}
  </button>
  <div
    id="ai-analysis-section"
    class="ai-analysis-wrapper"
    style="max-height: {showAiAnalysis
      ? '1000px'
      : '0'}; padding-top: {showAiAnalysis
      ? '0.5rem'
      : '0'}; padding-bottom: {showAiAnalysis ? '0.5rem' : '0'};"
    aria-hidden={!showAiAnalysis}
  >
    {#if showAiAnalysis}
      <AiAnalysis isSideBar={true} />
    {/if}
  </div>
  <div>
    <Tabs.Root
      value="bookmark"
      class="p-2"
      onValueChange={() => {
        Browser.runtime.sendMessage({ action: ACTION.UPDATE_TABS });
      }}
    >
      <Tabs.List class="grid w-full grid-cols-2 ">
        <!-- <Tabs.Trigger value="thispage">🕵️‍♀️ Ai Assistant</Tabs.Trigger> -->
        <Tabs.Trigger value="bookmark">Bookmarks</Tabs.Trigger>
        <Tabs.Trigger value="active">Active Tabs</Tabs.Trigger>
      </Tabs.List>

      <Tabs.Content value="active">
        <ActiveTabs></ActiveTabs>
        <SuggestionsSection></SuggestionsSection>
      </Tabs.Content>
      <Tabs.Content value="bookmark">
        <SearchSection></SearchSection>

        <BookMarkSection></BookMarkSection>
        <RecentlyBookmarked></RecentlyBookmarked>
      </Tabs.Content>
    </Tabs.Root>
  </div>
</div>

<style>
  .ai-analysis-wrapper {
    overflow: hidden;
    transition:
      max-height 1.4s cubic-bezier(0.4, 0, 0.2, 1),
      padding 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    max-height: 1000px; /* Adjust as needed for your content */
  }
</style>
