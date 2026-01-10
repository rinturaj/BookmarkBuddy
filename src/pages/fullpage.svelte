<script>
  import { ModeWatcher } from "mode-watcher";
  import Header from "../components/common/Header.svelte";
  import ActiveTabs from "../components/common/ActiveTabs.svelte";
  import SuggestionsSection from "../components/common/SuggestionsSection.svelte";
  import BookMarkSection from "../components/common/BookMarkSection.svelte";
  import SearchSection from "../components/common/SearchSection.svelte";
  import RecentlyBookmarked from "../components/common/RecentlyBookmarked.svelte";
  import { Github, Globe, Heart, Import } from "lucide-svelte";
  import BulkImport from "../components/common/BulkImport.svelte";

  let showImport = false;
</script>

<ModeWatcher />

<div>
  <div
    class="flex items-center justify-center gap-4 py-2 bg-secondary/10 border-b border-border/40"
  >
    <a
      href="https://github.com/rinturaj/BookmarkBuddy"
      target="_blank"
      class="flex items-center gap-1.5 text-sm text-muted-foreground/80 hover:text-primary transition-all duration-200 hover:scale-105"
    >
      <Github class="h-4 w-4" />
      <span>Source Code</span>
    </a>
    <div class="h-4 w-[1px] bg-border/60"></div>
    <a
      href="https://bookmarkbuddy.pages.dev/"
      target="_blank"
      class="flex items-center gap-1.5 text-sm text-muted-foreground/80 hover:text-primary transition-all duration-200 hover:scale-105"
    >
      <Globe class="h-4 w-4" />
      <span>Official Site</span>
    </a>
    <div class="h-4 w-[1px] bg-border/60"></div>
    <a
      href="https://github.com/sponsors/rinturaj"
      target="_blank"
      class="flex items-center gap-1.5 text-sm text-muted-foreground/80 hover:text-primary transition-all duration-200 hover:scale-105"
    >
      <Heart class="h-4 w-4 text-red-500" />
      <span>Become a Sponsor</span>
    </a>
    <div class="h-4 w-[1px] bg-border/60"></div>
    <button
      onclick={() => (showImport = !showImport)}
      class="flex items-center gap-1.5 text-sm text-muted-foreground/80 hover:text-primary transition-all duration-200 hover:scale-105"
    >
      <Import class="h-4 w-4" />
      <span>{showImport ? "Hide Import" : "Import Bookmarks"}</span>
    </button>
  </div>
  <Header></Header>
</div>

<div class="w-full h-full overflow-x-hidden">
  <div class="container mx-auto max-w-screen-2xl px-4 h-full">
    {#if showImport}
      <div class="py-4">
        <BulkImport />
      </div>
    {/if}
    <div class="flex flex-col lg:flex-row w-full h-full">
      <div class="w-full lg:w-1/2 xl:w-1/2 p-4 lg:border-r border-gray-200">
        <RecentlyBookmarked></RecentlyBookmarked>
        <ActiveTabs />
        <SuggestionsSection />
      </div>

      <div class="w-full lg:w-1/2 xl:w-1/2 p-4">
        <SearchSection />
        <BookMarkSection />
      </div>
    </div>
  </div>
</div>
