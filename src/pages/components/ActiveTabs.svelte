<script lang="ts">
  import { ExternalLink, Trash } from "lucide-svelte";
  import { Card, CardContent } from "$lib/components/ui/card";
  import { onMount } from "svelte";
  import Browser from "webextension-polyfill";
  import Button from "../../lib/components/ui/button/button.svelte";
  import { ACTION } from "../../const";

  // Active state management
  interface Tab {
    id: number | undefined;
    title: string | undefined;
    url: string | undefined;
    favicon: string | undefined;
  }

  // Sample data for active browser tabs
  let activeTabs: Tab[] = [];

  // Save current tab as bookmark
  function saveCurrentTab() {}
  async function fetchTabs() {
    const queriedTabs = await Browser.tabs.query({});
    if (!queriedTabs) return;
    activeTabs = queriedTabs
      .map((tab: any) => ({
        id: tab.id,
        title: tab.title,
        url: tab.url,
        favicon: tab.favIconUrl,
      }))
      .filter((tab: Tab) => tab.url && !tab.url.includes("chrome://"));
  }

  onMount(async () => {
    await fetchTabs();

    Browser.runtime.onMessage.addListener((message) => {
      if (message.action === ACTION.UPDATE_TABS) {
        fetchTabs();
      }
    });
  });

  function closeTab(id: number | undefined) {
    if (!id) return;
    chrome.tabs.remove(id);
  }
</script>

<!-- Active Tabs Section -->
<div class="px-4 py-3">
  <h2 class="text-lg font-semibold mb-2">Active Tabs</h2>
  <div class="flex flex-col space-y-2 max-h-fit overflow-y-auto">
    {#each activeTabs as tab}
      <Card class="p-0">
        <CardContent class="p-2">
          <div class="flex items-center justify-between">
            <div class="flex items-center flex-grow min-w-0 gap-2">
              <img src={tab.favicon} alt="" class="h-[16px]" srcset="" />
              <span class="text-sm truncate flex-grow min-w-0">{tab.title}</span
              >
            </div>
            <div class="flex items-center flex-shrink-0 gap-1">
              <Button
                href={tab?.url}
                target="_blank"
                variant="ghost"
                size="icon"
                class="h-8 w-8"
              >
                <ExternalLink class="h-4 w-4" />
              </Button>

              <Button
                role="button"
                variant="ghost"
                size="icon"
                class="h-8 w-8 text-red-400"
                onclick={() => {
                  closeTab(tab?.id);
                }}
              >
                <Trash class="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    {/each}
  </div>
</div>
