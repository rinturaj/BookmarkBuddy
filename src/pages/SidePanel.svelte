<script>
  import { Separator } from "$lib/components/ui/separator";
  import { ModeWatcher } from "mode-watcher";
  import Header from "./components/Header.svelte";
  import ActiveTabs from "./components/ActiveTabs.svelte";
  import SearchSection from "./components/SearchSection.svelte";
  import SuggestionsSection from "./components/SuggestionsSection.svelte";
  import BookMarkSection from "./components/BookMarkSection.svelte";
  import * as Tabs from "$lib/components/ui/tabs";
</script>

<ModeWatcher />

<div class={`flex flex-col h-full w-full  bg-background`}>
  <Header></Header>
  <SearchSection></SearchSection>
  <Tabs.Root value="active" class="p-2">
    <Tabs.List class="grid w-full grid-cols-2 ">
      <Tabs.Trigger value="active">Active Tabs</Tabs.Trigger>
      <Tabs.Trigger value="bookmark">Bookmarks</Tabs.Trigger>
    </Tabs.List>
    <Tabs.Content value="active">
      <ActiveTabs></ActiveTabs>
      <SuggestionsSection></SuggestionsSection>
    </Tabs.Content>
    <Tabs.Content value="bookmark">
      <BookMarkSection></BookMarkSection>
    </Tabs.Content>
  </Tabs.Root>
</div>
