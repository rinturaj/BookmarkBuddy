<script lang="ts">
  import { ExternalLink, Trash2 } from "lucide-svelte";
  import { fade } from "svelte/transition";
  import Button from "../../lib/components/ui/button/button.svelte";
  import { getFaviconFromUrl } from "../../script/bookmark.util";
  import Separator from "../../lib/components/ui/separator/separator.svelte";

  export let bookmarkDetails;
  export let removeBookmark;
</script>

<div class="space-y-1" in:fade={{ duration: 300 }}>
  <div class=" p-1 rounded-md relative overflow-hidden group">
    <h6
      class=" border-b pb-2 text-xl font-semibold tracking-tight transition-colors first:mt-0"
    >
      {bookmarkDetails?.title}
    </h6>
    <p class="leading-2">
      {bookmarkDetails?.details}
    </p>

    <h6 class="text-sm font-semibold mt-2">Usefull links</h6>
    <ul class=" ml-6 list-decimal [&>li]:mt-2">
      {#each bookmarkDetails?.links as links}
        <li>
          <a class="text-primary cursor-pointer" href={links} target="_blank"
            >{links}</a
          >
        </li>
      {/each}
    </ul>
    <h6 class="text-sm font-semibold mt-2">Similar Websites</h6>
    <ul class=" ml-1 list-none [&>li]:mt-2">
      {#each bookmarkDetails?.alternatives as links}
        <li class="flex">
          <img
            src={getFaviconFromUrl(links)}
            class="h-[16px] mr-2"
            alt=""
            srcset=""
          />
          <a class="text-primary cursor-pointer" href={links} target="_blank">
            {links}</a
          >
        </li>
      {/each}
    </ul>
  </div>
  <div class="flex align-middle items-center justify-end gap-2">
    <span class="text-xs text-muted-foreground"
      >Created On {new Date(bookmarkDetails.dateAdded).toDateString()}</span
    >
    <Separator orientation="vertical"></Separator>
    <Button variant="ghost" size="icon" on:click={removeBookmark}>
      <ExternalLink class="h-3.5 w-3.5 text-primary" />
    </Button>
    <Button variant="ghost" size="icon" on:click={removeBookmark}>
      <Trash2 class="h-3.5 w-3.5 text-red-600" />
    </Button>
  </div>
</div>
