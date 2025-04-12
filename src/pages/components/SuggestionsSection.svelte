<script lang="ts">
  import { Card, CardContent } from "$lib/components/ui/card";
  import { onMount } from "svelte";
  import Browser from "webextension-polyfill";
  import { ACTION } from "../../const";
  import { getFaviconFromUrl } from "../../script/bookmark.util";

  let frequentLinks: any[] = [];

  onMount(async () => {
    await fetchFrequentLinks();
    Browser.runtime.onMessage.addListener((message) => {
      if (message.action === ACTION.UPDATE_TABS) {
        fetchFrequentLinks();
      }
    });
  });
  // Fetch top 5 most visited links from history
  async function fetchFrequentLinks() {
    const historyItems = await Browser.history.search({
      text: "",
      maxResults: 100,
    });
    // Sort by visit count and take top 5

    frequentLinks = historyItems
      .reduce((x: any[], a) => {
        a.title;
        let isContined = x.findIndex((y: any) => y.title == a.title);
        if (isContined >= 0) {
          x[isContined].visitCount = x[isContined].visitCount + a.visitCount;
        } else {
          x.push(a);
        }
        return x;
      }, [])
      .sort((a: any, b: any) => b.visitCount - a.visitCount)
      .slice(0, 5);
  }

  // Save current tab as bookmark
</script>

<!-- Suggestions -->
<div class="px-4 mb-4">
  <h2 class="text-lg font-semibold mb-2">Suggestions</h2>
  <Card>
    <CardContent class="p-2">
      {#each frequentLinks as suggestion}
        <a
          href={suggestion.url}
          target="_blank"
          class="flex items-center justify-between gap-3 p-2 hover:bg-muted cursor-pointer rounded-md transition-colors"
        >
          <div class="flex items-center gap-2">
            <div class="text-foreground">
              <img
                src={getFaviconFromUrl(suggestion.url)}
                alt=""
                class="h-[16px]"
                srcset=""
              />
            </div>
            <span class="text-sm truncate max-w-[200px]"
              >{suggestion.title}</span
            >
          </div>
          <div>
            <span class="text-xs">Visits</span>
            <span class="font-bold text-sm">{suggestion.visitCount}</span>
          </div>
        </a>
      {/each}
    </CardContent>
  </Card>
</div>
