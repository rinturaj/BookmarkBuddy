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
  import { getCurrenttab } from "../../script/bookmark.util";
  import { ACTION } from "../../const";
  import { onMount } from "svelte";
  import { WebhookIcon } from "lucide-svelte";

  export let isSideBar = false;
  async function getCurrentTabDetails() {
    currentTab = await getCurrenttab();
    console.log(currentTab);
    currentPage.favicon = currentTab.favIconUrl || "";
    currentPage.url = currentTab.url || "";
    currentPage.title = currentTab.title || "";
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
        }
      }
    );
  });
  // State management
  let isBookmarked = false; // Set to true to test the bookmarked state
  let isLoading = false;
  let progress = 0;
  let showSuccess = false;
  let pulseBookmark = true;

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

  // Function to handle bookmark action
  function handleBookmark() {
    isLoading = true;
    progress = 0;

    // Simulate progress
    const interval = setInterval(() => {
      progress += 2;
      if (progress >= 100) {
        clearInterval(interval);
        isLoading = false;
        isBookmarked = true;
        showSuccess = true;
        setTimeout(() => {
          showSuccess = false;
        }, 3000);
      }
    }, 30);
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
    <BookmarkCard {currentPage} {bookmarkDetails} {removeBookmark} />
  {:else}
    <NotBookmarkedAlert {currentPage} {onCancel} {onConfirm} />
  {/if}
  <RelatedBookmarks {currentPage} {relatedBookmarks} {getDomain} />
</div>
