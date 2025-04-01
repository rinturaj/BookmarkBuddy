<script lang="ts">
  import { Loader2 } from "lucide-svelte";
  import { fade } from "svelte/transition";
  import Progress from "../../lib/components/ui/progress/progress.svelte";

  export let isLoading;
  export let isBookmarked;
  export let progress;
</script>

{#if isLoading}
  <div class="py-6 space-y-4" in:fade={{ duration: 200 }}>
    <div class="flex justify-center">
      <Loader2 class="h-10 w-10 animate-spin text-primary" />
    </div>
    <Progress value={progress} class="h-2 w-full bg-primary/20" />
    <p class="text-center text-sm text-muted-foreground animate-pulse">
      {isBookmarked ? "Removing bookmark..." : "Adding bookmark..."}
    </p>
  </div>
{/if}
