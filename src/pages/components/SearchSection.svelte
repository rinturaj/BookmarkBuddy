<script lang="ts">
  import { Search } from "lucide-svelte";

  // Import shadcn-svelte components
  import { Input } from "$lib/components/ui/input";
  import { onMount } from "svelte";
  import {
    bookmarks,
    loadBookmarks,
    searchBookmarks,
  } from "../../script/bookmarkStore";
  import { get } from "svelte/store";
  import Button from "../../lib/components/ui/button/button.svelte";
  import { handleEnhancedSearch } from "../../script/enhancedSearch";
  let query = "";
  let results: any[] = [];

  onMount(async () => {
    await loadBookmarks();
  });

  async function handleSearch() {
    const list = get(bookmarks);
    results = await searchBookmarks(query, list);
    handleEnhancedSearch(query, list);
  }
</script>

<!-- Search Bar -->
<div class="px-4 mb-4 relative">
  <div class="relative">
    <Search
      class="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5"
    />
    <Input bind:value={query} placeholder="search here" class="pl-10" />
    <Button onclick={handleSearch}>Search</Button>
  </div>
</div>
{#if results.length > 0}
  <h3>Results:</h3>
  {#each results as b}
    <div style="border: 1px solid #ccc; padding: 8px; margin: 5px;">
      <strong>{b.title}</strong><br />
      <a href={b.url} target="_blank">{b.url}</a><br />
      <small>{b.description}</small><br />
      <small>Saved: {b.createdAt}</small>
    </div>
  {/each}
{/if}
