<script lang="ts">
  import { Separator } from "$lib/components/ui/separator";
  import { ModeWatcher } from "mode-watcher";
  import ActiveTabs from "./components/ActiveTabs.svelte";
  import SuggestionsSection from "./components/SuggestionsSection.svelte";
  import BookMarkSection from "./components/BookMarkSection.svelte";
  import * as Tabs from "$lib/components/ui/tabs";
  import Header from "./components/Header.svelte";
  import SearchSection from "./components/SearchSection.svelte";
  import AiAnalysis from "./components/AiAnalysis.svelte";
  import Browser from "webextension-polyfill";
  import { ACTION } from "../const";
  import { onMount } from "svelte";
  import { initAnalytics, trackPageView } from "../script/analytics";

  onMount(() => {
    initAnalytics();
    trackPageView("sidepanel");
  });
</script>

<ModeWatcher />

<div class={`flex flex-col h-full w-full  bg-background`}>
  <Header></Header>

  <AiAnalysis isSideBar={true}></AiAnalysis>

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
    <!-- <Tabs.Content value="thispage"> -->
    <!-- </Tabs.Content> -->
    <Tabs.Content value="active">
      <ActiveTabs></ActiveTabs>
      <SuggestionsSection></SuggestionsSection>
    </Tabs.Content>
    <Tabs.Content value="bookmark">
      <SearchSection></SearchSection>

      <BookMarkSection></BookMarkSection>
    </Tabs.Content>
  </Tabs.Root>
</div>
