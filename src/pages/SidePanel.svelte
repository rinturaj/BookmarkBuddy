<script lang="ts">
  import { Separator } from "$lib/components/ui/separator";
  import { ModeWatcher } from "mode-watcher";
  import ActiveTabs from "./components/ActiveTabs.svelte";
  import SuggestionsSection from "./components/SuggestionsSection.svelte";
  import BookMarkSection from "./components/BookMarkSection.svelte";
  import * as Tabs from "$lib/components/ui/tabs";
  import Header from "./components/Header.svelte";
  import SearchSection from "./components/SearchSection.svelte";
  import BookmarkCard from "./components/BookmarkCard.svelte";
  import AiAnalysis from "./components/AiAnalysis.svelte";
  import Browser from "webextension-polyfill";
  import { ACTION } from "../const";

  const currentPage = {
    title: "GitHub: Let's build from here",
    url: "https://github.com",
    favicon: "🌐",
    description:
      "GitHub is where over 100 million developers shape the future of software, together. Contribute to the open source community, manage your Git repositories, review code, track bugs, and more.",
  };

  // Sample related bookmarks from the same domain
  const relatedBookmarks = [
    {
      title: "GitHub - shadcn-svelte/ui: Shadcn UI port for Svelte",
      url: "https://github.com/shadcn-svelte/ui",
      addedOn: "2 days ago",
    },
    {
      title: "GitHub - sveltejs/svelte: Cybernetically enhanced web apps",
      url: "https://github.com/sveltejs/svelte",
      addedOn: "1 week ago",
    },
    {
      title: "GitHub - vercel/next.js: The React Framework",
      url: "https://github.com/vercel/next.js",
      addedOn: "3 weeks ago",
    },
  ];

  // Bookmark details (if already bookmarked)
  const bookmarkDetails = {
    addedOn: "April 15, 2023",
    folder: "Development",
    tags: ["github", "code", "development"],
    notes:
      "Main GitHub homepage. Good starting point for finding repositories and projects.",
  };
  // Function to remove bookmark
  function removeBookmark() {}
</script>

<ModeWatcher />

<div class={`flex flex-col h-full w-full  bg-background`}>
  <Header></Header>

  <Tabs.Root
    value="bookmark"
    class="p-2"
    onValueChange={() => {
      Browser.runtime.sendMessage({ action: ACTION.UPDATE_TABS });
    }}
  >
    <Tabs.List class="grid w-full grid-cols-3 ">
      <Tabs.Trigger value="thispage">🕵️‍♀️ Ai Assistant</Tabs.Trigger>
      <Tabs.Trigger value="bookmark">Bookmarks</Tabs.Trigger>
      <Tabs.Trigger value="active">Active Tabs</Tabs.Trigger>
    </Tabs.List>
    <Tabs.Content value="thispage">
      <AiAnalysis isSideBar={true}></AiAnalysis>
    </Tabs.Content>
    <Tabs.Content value="active">
      <ActiveTabs></ActiveTabs>
      <SuggestionsSection></SuggestionsSection>
    </Tabs.Content>
    <Tabs.Content value="bookmark">
      <SearchSection></SearchSection>

      <BookMarkSection></BookMarkSection>
    </Tabs.Content>
  </Tabs.Root>
</div>
