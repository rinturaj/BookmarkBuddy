<script>
  import { ModeWatcher } from "mode-watcher";
  import Header from "../components/common/Header.svelte";
  import ActiveTabs from "../components/common/ActiveTabs.svelte";
  import SuggestionsSection from "../components/common/SuggestionsSection.svelte";
  import BookMarkSection from "../components/common/BookMarkSection.svelte";
  import SearchSection from "../components/common/SearchSection.svelte";
  import RecentlyBookmarked from "../components/common/RecentlyBookmarked.svelte";
</script>

<ModeWatcher />

<div>
  <Header></Header>
</div>

<div class="w-full h-full overflow-x-hidden">
  <div class="container mx-auto max-w-screen-2xl px-4 h-full">
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
