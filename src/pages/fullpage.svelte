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

<div class="container flex w-full h-full">
  <!-- Left section -->
  <div class="flex-1 p-4 border-r border-gray-200">
    <RecentlyBookmarked></RecentlyBookmarked>

    <ActiveTabs />
    <SuggestionsSection />
  </div>
  <!-- Right section -->
  <div class="flex-1 p-4">
    <SearchSection />
    <BookMarkSection />
  </div>
</div>
