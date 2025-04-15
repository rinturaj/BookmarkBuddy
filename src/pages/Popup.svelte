<script lang="ts">
  import { quintInOut } from "svelte/easing";
  import type { TransitionConfig } from "svelte/transition";

  function flyFade(
    node: Element,
    { x = 40, duration = 300, easing = quintInOut } = {}
  ): TransitionConfig {
    return {
      duration,
      easing,
      css: (t: number) => {
        const opacity = t;
        const translate = x * (1 - t);
        return `opacity: ${opacity}; transform: translateX(${translate}px);`;
      },
    };
  }

  import {
    Plus,
    Save,
    Search,
    SearchCheckIcon,
    Sidebar,
    X,
  } from "lucide-svelte";

  import { fade, fly } from "svelte/transition";
  import { quintOut } from "svelte/easing";

  import { Button } from "$lib/components/ui/button";
  import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
  } from "$lib/components/ui/card";
  import AiAnalysis from "./components/AiAnalysis.svelte";
  import { onMount } from "svelte";
  import Browser from "webextension-polyfill";
  import { ACTION } from "../const";
  import { getCurrenttab } from "../script/bookmark.util";
  import SearchSection from "./components/SearchSection.svelte";
  import SearchResult from "./components/SearchResult.svelte";
  import { initAnalytics, trackPageView } from "../script/analytics";

  onMount(() => {
    try {
      initAnalytics();
      trackPageView("pupup");
    } catch (error) {
      console.error("Error tracking page view:", error);
    }
  });

  let toggleView = false;

  async function getCurrentTabDetails() {
    currentTab = await getCurrenttab();
    console.log(currentTab);
    currentPage.favicon = currentTab.favIconUrl || "";
    currentPage.url = currentTab.url || "";
    currentPage.title = currentTab.title || "";
    const v = await Browser.storage.local.get(currentPage.url.toString());
  }
  // Current page info (would come from Chrome API in real extension)
  let currentPage = {
    title: "",
    url: "",
    favicon: "",
    description: "",
  };
  let currentTab;

  onMount(async () => {
    await getCurrentTabDetails();

    Browser.runtime.onMessage.addListener(async (message) => {
      if (message.action === ACTION.CAPTURE_CONTENT) {
        currentPage = message;
        console.log(message);
        currentTab = await getCurrenttab();
        console.log(currentTab);
        currentPage.favicon = currentTab.favIconUrl || "";
      }
      if (message.action === ACTION.UPDATE_TABS) {
        await getCurrentTabDetails();
      }
    });
  });
</script>

<div
  in:fly={{ y: 20, duration: 400, easing: quintOut }}
  out:fade={{ duration: 200 }}
>
  <Card class="w-[350px] shadow-lg overflow-hidden border-2 border-primary/10">
    <div
      class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/30 via-primary to-primary/30 opacity-80"
    ></div>

    <CardHeader class="pb-2">
      <div class="flex justify-between items-start">
        <div class="flex items-center gap-2">
          <img src={currentPage.favicon} alt="" class="h-[32px]" />
          <div>
            <CardTitle class="text-base">{currentPage.title}</CardTitle>
            <CardDescription class="text-xs truncate max-w-[250px]">
              {currentPage.url}
            </CardDescription>
          </div>
        </div>
        <Button
          onclick={async () => {
            window.close();
          }}
          variant="ghost"
          size="icon"
          class="h-8 w-8 -mt-1 -mr-2 hover:rotate-90 transition-transform duration-200"
        >
          <X class="h-4 w-4" />
        </Button>
      </div>
    </CardHeader>

    <CardContent
      class={!!toggleView
        ? "p-0 pt-3 bg-white/50 pb-2 rounded-xl min-h-[200px]"
        : "p-3 pt-2"}
    >
      {#if !toggleView}
        <div
          in:flyFade={{ x: 40, duration: 300 }}
          out:flyFade={{ x: -40, duration: 200 }}
        >
          <AiAnalysis />
        </div>
      {:else}
        <div
          in:flyFade={{ x: 40, duration: 300 }}
          out:flyFade={{ x: -40, duration: 200 }}
        >
          <SearchSection />
          <SearchResult />
        </div>
      {/if}
    </CardContent>

    <CardFooter class="flex justify-between pt-0">
      <Button
        onclick={() => (toggleView = !toggleView)}
        variant="ghost"
        size="sm"
        class="hover:bg-primary/10 transition-colors duration-200"
      >
        <Search class="h-3.5 w-3.5 mr-1" />
        Search Bookmark
      </Button>
      <Button
        onclick={async () => {
          let [tab] = await chrome.tabs.query({
            active: true,
            currentWindow: true,
          });

          if (tab) {
            await chrome.sidePanel.open({ tabId: tab?.id || 0 });
            window.close();
            return;
          }
        }}
        variant="ghost"
        size="sm"
        class="hover:bg-primary/10 transition-colors duration-200"
      >
        <Sidebar class="h-3.5 w-3.5 mr-1" />
        Sidepanel
      </Button>
    </CardFooter>
  </Card>
</div>

<style>
  /* Custom animations */
  @keyframes shine {
    from {
      transform: translateX(-100%);
    }
    to {
      transform: translateX(100%);
    }
  }

  /* Progress bar styling */
  :global(.progress-value) {
    transition: width 0.3s ease;
  }
</style>
