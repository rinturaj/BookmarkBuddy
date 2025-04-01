<script lang="ts">
  import { Link2, Bookmark, Clock } from "lucide-svelte";
  import Separator from "../../lib/components/ui/separator/separator.svelte";

  export let relatedBookmarks;
  export let getDomain;
  export let currentPage;
</script>

{#if relatedBookmarks.length > 0}
  <Separator class="my-4" />
  <div>
    <h3 class="text-sm font-medium flex items-center gap-1 mb-2">
      <Link2 class="h-4 w-4" />
      Other bookmarks from {getDomain(currentPage.url)}
    </h3>
    <div class="space-y-2 max-h-[150px] overflow-y-auto pr-1">
      {#each relatedBookmarks as bookmark, i}
        <div
          class="flex items-start gap-2 p-2 hover:bg-muted rounded-md text-sm transition-all duration-200"
        >
          <Bookmark class="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
          <div class="relative">
            <p class="font-medium line-clamp-1">{bookmark.title}</p>
            <div
              class="flex items-center gap-1 text-xs text-muted-foreground mt-1"
            >
              <Clock class="h-3 w-3" />
              <span>Added {bookmark.addedOn}</span>
            </div>
          </div>
        </div>
      {/each}
    </div>
  </div>
{/if}
