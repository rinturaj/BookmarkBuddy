<script lang="ts">
  import Browser from "webextension-polyfill";
  import BookmarkCard from "./BookmarkCard.svelte";
  import LoadingIndicator from "./LoadingIndicator.svelte";
  import NotBookmarkedAlert from "./NotBookmarkedAlert.svelte";
  import RelatedBookmarks from "./RelatedBookmarks.svelte";
  import SuccessAlert from "./SuccessAlert.svelte";
  import CardHeader from "../../lib/components/ui/card/card-header.svelte";
  import CardTitle from "../../lib/components/ui/card/card-title.svelte";
  import CardDescription from "../../lib/components/ui/card/card-description.svelte";
  import { bookmarkUrl, getCurrenttab } from "../../script/bookmark.util";
  import { ACTION } from "../../const";
  import { onMount } from "svelte";
  import { WebhookIcon } from "lucide-svelte";
  import { callAiapi } from "../../script/ai";

  export let isSideBar = false;
  async function getCurrentTabDetails() {
    currentTab = await getCurrenttab();
    currentPage.favicon = currentTab.favIconUrl || "";
    currentPage.url = currentTab.url || "";
    currentPage.title = currentTab.title || "";
    const v = await Browser.storage.local.get(currentPage.url.toString());
    bookmarkDetails = v[currentPage.url.toString()];
  }
  // Current page info (would come from Chrome API in real extension)
  let currentPage = {
    title: "",
    url: "",
    favicon: "",
    description: "",
  };
  let currentTab;

  onMount(async () => {
    await getCurrentTabDetails();

    Browser.runtime.onMessage.addListener(
      async (message, sender, sendResponse) => {
        console.log("AI Messages");

        if (message.action === ACTION.CAPTURE_CONTENT) {
          currentPage = message;
          console.log(message);
          currentTab = await getCurrenttab();
          console.log(currentTab);
          currentPage.favicon = currentTab.favIconUrl || "";
        }
        if (message.action === ACTION.UPDATE_TABS) {
          await getCurrentTabDetails();
          isBookmarked = !!bookmarkDetails ? true : false;
        }
      }
    );
  });

  let bookmarkDetails: any;
  // State management
  let isBookmarked = false; // Set to true to test the bookmarked state
  let isLoading = false;
  let progress = 0;
  let showSuccess = false;
  let pulseBookmark = true;

  // Sample related bookmarks from the same domain
  const relatedBookmarks: any = [];

  // Function to handle bookmark action
  async function handleBookmark() {
    isLoading = true;
    progress = 0;
    bookmarkDetails = await callAiapi(currentPage);

    const jsonMatch = bookmarkDetails?.result?.response.match(/{[\s\S]*}/);
    if (jsonMatch) {
      const jsonString = jsonMatch[0];
      const jsonObject = JSON.parse(jsonString);
      bookmarkDetails = jsonObject;
      let value = { [currentPage.url]: bookmarkDetails }; // Use computed property name
      await Browser.storage.local.set(value);
    }
    await bookmarkUrl(
      currentPage.url,
      bookmarkDetails.title,
      bookmarkDetails.category
    );
    isLoading = false;
    isBookmarked = true;
    showSuccess = true;
    setTimeout(() => {
      showSuccess = false;
    }, 2000);
  }

  // Function to remove bookmark
  function removeBookmark() {
    isLoading = true;
    progress = 0;

    // Simulate progress
    const interval = setInterval(() => {
      progress += 5;
      if (progress >= 100) {
        clearInterval(interval);
        isLoading = false;
        isBookmarked = false;
      }
    }, 50);
  }

  // Extract domain from URL
  function getDomain(url: any) {
    try {
      const domain = new URL(url).hostname;
      return domain;
    } catch (e) {
      return url;
    }
  }

  // Start pulse animation for bookmark button
  function startPulse() {
    setTimeout(() => {
      pulseBookmark = true;
      setTimeout(() => {
        pulseBookmark = false;
      }, 2000);
    }, 1000);
  }

  function onCancel() {}
  function onConfirm() {
    console.log("Book marked");
    handleBookmark();
  }
  // Start pulse animation after component mounts
  startPulse();
</script>

<div class={isSideBar ? "p-1" : ""}>
  {#if isSideBar}
    <CardHeader class="mb-2 p-2">
      <div class="flex justify-between items-start">
        <div class="flex items-center gap-2">
          <img src={currentPage.favicon} alt="" class="h-[32px]" />
          <div>
            <CardTitle class="text-base">{currentPage.title}</CardTitle>
            <CardDescription class="text-xs truncate max-w-[250px]">
              {currentPage.url}
            </CardDescription>
          </div>
        </div>
      </div>
    </CardHeader>
  {/if}
  <LoadingIndicator {isLoading} {progress} {isBookmarked} />
  <SuccessAlert {showSuccess} />
  {#if isBookmarked}
    <BookmarkCard {bookmarkDetails} {removeBookmark} />
  {:else if !isLoading}
    <NotBookmarkedAlert {onCancel} {onConfirm} />
  {/if}
  <RelatedBookmarks {currentPage} {relatedBookmarks} {getDomain} />
</div>
