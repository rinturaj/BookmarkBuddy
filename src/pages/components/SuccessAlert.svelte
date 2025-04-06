<script lang="ts">
  import { Check } from "lucide-svelte";
  import Alert from "../../lib/components/ui/alert/alert.svelte";
  import AlertTitle from "../../lib/components/ui/alert/alert-title.svelte";
  import AlertDescription from "../../lib/components/ui/alert/alert-description.svelte";
  import { scale } from "svelte/transition";
  import { elasticOut } from "svelte/easing";

  export let showSuccess;
</script>

{#if showSuccess}
  <div in:scale={{ duration: 400, easing: elasticOut, start: 0.8 }}>
    <Alert
      variant="default"
      class="bg-green-50 my-2 text-green-800 border-green-200"
    >
      <Check class="h-4 w-4 text-green-600" />
      <AlertTitle>Success!</AlertTitle>
      <AlertDescription>
        Page has been bookmarked successfully.
      </AlertDescription>
    </Alert>
  </div>
{/if}
