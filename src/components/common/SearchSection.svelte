<script lang="ts">
  import { Search } from "lucide-svelte";

  // Import shadcn-svelte components
  import { Input } from "$lib/components/ui/input";
  import { onMount } from "svelte";
  import {
    bookmarks,
    loadBookmarks,
    searchBookmarks,
    searchQuery,
  } from "../../script/bookmarkStore";
  import { derived, get } from "svelte/store";
  import { trackEvent } from "../../script/analytics";
  let query = "";
  function applyQuery(val: string) {
    query = val;
    // You can also trigger any search logic here
  }
  $: applyQuery($searchQuery);

  onMount(async () => {
    await loadBookmarks();
  });

  let debounceTimeout: any = null;

  async function handleSearch() {
    clearTimeout(debounceTimeout);

    // Start a new timer
    debounceTimeout = setTimeout(async () => {
      searchBookmarks(query);
      trackEvent("search", {
        id: "bookmark_search",
        name: "bookmark_search",
        query: query,
      });
    }, 500); // Adjust delay as needed
    // handleEnhancedSearch(query, list);
  }
</script>

<!-- Search Bar -->
<div class="px-2 mb-2 relative">
  <div class="relative">
    <Search
      class="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5"
    />
    <Input
      bind:value={query}
      oninput={handleSearch}
      placeholder="search here"
      class="pl-10"
    />
  </div>
</div>
