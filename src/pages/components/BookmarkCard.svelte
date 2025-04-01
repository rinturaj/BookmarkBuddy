<script lang="ts">
  import { Clock, Trash2 } from "lucide-svelte";
  import { fade } from "svelte/transition";
  import Button from "../../lib/components/ui/button/button.svelte";

  export let currentPage;
  export let bookmarkDetails;
  export let removeBookmark;
</script>

<div class="space-y-4" in:fade={{ duration: 300 }}>
  <div class="bg-muted p-3 rounded-md text-sm relative overflow-hidden group">
    <div
      class="absolute top-0 right-0 h-16 w-16 -mt-8 -mr-8 bg-primary/5 rounded-full transform rotate-45"
    ></div>
    <p class="text-muted-foreground mb-1 line-clamp-3 relative">
      {currentPage.description}
    </p>
    <div
      class="flex items-center gap-1 text-xs text-muted-foreground mt-2 relative"
    >
      <Clock class="h-3 w-3" />
      <span>Added on {bookmarkDetails.addedOn}</span>
    </div>
  </div>
  <div class="flex justify-end gap-2">
    <Button variant="destructive" size="sm" on:click={removeBookmark}>
      <Trash2 class="h-3.5 w-3.5 mr-1" />
      Remove
    </Button>
  </div>
</div>
