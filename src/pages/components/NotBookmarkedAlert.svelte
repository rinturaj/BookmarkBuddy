<script lang="ts">
  import { Bookmark } from "lucide-svelte";
  import {
    Alert,
    AlertTitle,
    AlertDescription,
  } from "../../lib/components/ui/alert";
  import Button from "../../lib/components/ui/button/button.svelte";

  export let currentPage;
  export let onConfirm;
  export let onCancel;
</script>

<Alert class="border-primary/30 bg-primary/5">
  <Bookmark class="h-4 w-4 text-primary" />
  <AlertTitle>Not bookmarked</AlertTitle>
  <AlertDescription>Would you like to bookmark this page?</AlertDescription>
  <div class="flex justify-end">
    <Button variant="ghost" size="sm" on:click={onCancel} class="mr-2 "
      >No</Button
    >
    <Button
      variant="default"
      size="sm"
      onclick={onConfirm}
      class=" animate-bounce">Yes</Button
    >
  </div>
</Alert>
