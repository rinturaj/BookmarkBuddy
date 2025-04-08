<script lang="ts">
  import { Bookmark } from "lucide-svelte";
  import {
    Alert,
    AlertTitle,
    AlertDescription,
  } from "../../lib/components/ui/alert";
  import Button from "../../lib/components/ui/button/button.svelte";

  export let onConfirm;
  export let onCancel;
</script>

<!-- 
<Alert
  class="border-primary/30 mt-2 bg-primary/55 dark:bg-sidebar-accent  dark:text-primary"
>
  <img
    src="path_to_your_image"
    alt="Bookmark Icon"
    class="h-4 w-4 dark:text-primary"
  />
  <AlertTitle>Not bookmarked</AlertTitle>
  <AlertDescription
    >Let's bookmark this page and capture its context for easy recall!</AlertDescription
  >
  <div class="flex justify-end mt-3">
    <Button variant="ghost" size="sm" on:click={onCancel} class="mr-2 "
      >No</Button
    >
    <Button size="sm" onclick={onConfirm} class=" animate-bounce">Yes</Button>
  </div>
</Alert> -->

<Alert
  class="mt-4 rounded-xl border dark:border-white border-primary/30 bg-primary/10 px-4 py-4 text-primary dark:bg-muted-foreground/10 dark:text-white shadow-sm"
>
  <div class="flex items-start gap-3">
    <!-- Icon -->
    <img
      src="https://cdn-icons-png.flaticon.com/512/4076/4076507.png"
      alt="Bookmark Icon"
      class="h-6 w-6 mt-1"
    />

    <!-- Content -->
    <div class="flex-1">
      <AlertTitle class="text-lg font-semibold">Not Bookmarked</AlertTitle>
      <AlertDescription class="mt-1 text-sm text-primary/90 dark:text-white/80">
        Let's bookmark this page and capture its context for easy recall!
      </AlertDescription>

      <!-- Buttons -->
      <div class="mt-4 flex justify-end space-x-2">
        <Button variant="ghost" size="sm" onclick={onCancel}>No</Button>
        <Button size="sm" onclick={onConfirm} class="animate-bounce">
          Yes
        </Button>
      </div>
    </div>
  </div>
</Alert>
