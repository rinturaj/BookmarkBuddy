<script lang="ts">
  import browser from "webextension-polyfill";
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
  import { callAiapi } from "../../script/ai";
  import { getDataByUrlKeys } from "../../script/bookmarkStore";
  import { trackEvent } from "../../script/analytics";
  import * as Accordion from "$lib/components/ui/accordion/index";
  import Button from "../../lib/components/ui/button/button.svelte";

  export let isSideBar = false;
  async function getCurrentTabDetails() {
    isCollapsed = true;
    isLoading = false;
    currentTab = await getCurrenttab();
    currentPage.favicon = currentTab.favIconUrl || "";
    currentPage.url = currentTab.url || "";
    currentPage.title = currentTab.title || "";
    const v = await browser.storage.local.get(currentPage.url.toString());
    bookmarkDetails = v[currentPage.url.toString()];
    isBookmarked = !!bookmarkDetails ? true : false;
    isCollapsed = false;
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
    browser.runtime.onMessage.addListener(
      async (message, sender, sendResponse) => {
        if (message.action === ACTION.CAPTURE_CONTENT) {
          currentPage = message;

          currentTab = await getCurrenttab();

          currentPage.favicon = currentTab.favIconUrl || "";
        }
        if (message.action === ACTION.UPDATE_TABS) {
          await getCurrentTabDetails();
        }
        if (message.action === ACTION.BOOKMARK_URL && isSideBar == false) {
          isLoading = false;
          await handleBookmark();
        }
        if (message.action === ACTION.UPDATE_VECTORS) {
          showSuccess = true;
          setTimeout(() => {
            showSuccess = false;
          }, 2000);
        }
      }
    );
  });

  let bookmarkDetails: any;
  let isBookmarked = false; // Set to true to test the bookmarked state
  let isLoading = false;
  let progress = 0;
  let showSuccess = false;
  let pulseBookmark = true;

  // Sample related bookmarks from the same domain
  const relatedBookmarks: any = [];

  // Function to handle bookmark action
  async function handleBookmark() {
    if (isBookmarked) {
      const v = await browser.storage.local.get(currentPage.url.toString());
      bookmarkDetails = v[currentPage.url.toString()];
      isBookmarked = !!bookmarkDetails ? true : false;
      isLoading = false;
      return;
    }
    isLoading = true;
    let status = await browser.bookmarks.create({
      parentId: "1",
      title: currentPage.title,
      url: currentPage.url,
    });
    console.log(status);
    window.close();
    // progress = 0;
    // const interval = setInterval(() => {
    //   progress += 5;
    //   if (progress >= 40) {
    //     clearInterval(interval);
    //   }
    // }, 50);
    // trackEvent("button_click", {
    //   button_id: "bookmark_button",
    //   button_text: "Bookmark",
    // });
    // await browser.runtime.sendMessage({
    //   action: ACTION.BOOKMARK_URL,
    //   data: currentPage,
    // });
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

  let isCollapsed = false;
  function onCancel() {
    isCollapsed = true;
  }
  function onConfirm() {
    handleBookmark();
  }
  // Start pulse animation after component mounts
  startPulse();
</script>

<div class={isSideBar ? "p-2" : ""}>
  {#if isSideBar}
    <CardHeader class="mb-2 p-1">
      <div class="flex flex-grow-0 justify-between items-start w-full">
        <div class="flex items-start flex-grow min-w-0 gap-2">
          <img src={currentPage.favicon} alt="" class="h-8 w-8 flex-shrink-0" />

          <div class="min-w-0">
            <CardTitle
              class="text-base truncate max-w-full overflow-hidden whitespace-nowrap"
            >
              {currentPage.title}
            </CardTitle>
            <CardDescription
              class="text-xs truncate max-w-full overflow-hidden whitespace-nowrap"
            >
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
    <BookmarkCard {bookmarkDetails} />
  {:else if !isLoading && !isCollapsed}
    <NotBookmarkedAlert {onCancel} {onConfirm} />
  {:else if !isLoading && isCollapsed}
    <Button
      variant="ghost"
      onclick={onConfirm}
      class="w-full bg-secondary/20 text-prumary"
      size="sm">Click here to bookmark this page</Button
    >
  {/if}
  <RelatedBookmarks {currentPage} {relatedBookmarks} {getDomain} />
</div>
