<script lang="ts">
  import { Plus, Save, X } from "lucide-svelte";
  import BookmarkCard from "./components/BookmarkCard.svelte";
  import LoadingIndicator from "./components/LoadingIndicator.svelte";
  import SuccessAlert from "./components/SuccessAlert.svelte";
  import NotBookmarkedAlert from "./components/NotBookmarkedAlert.svelte";
  import RelatedBookmarks from "./components/RelatedBookmarks.svelte";

  import { fade, fly } from "svelte/transition";
  import { quintOut } from "svelte/easing";

  // Import shadcn-svelte components
  import { Button } from "$lib/components/ui/button";
  import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
  } from "$lib/components/ui/card";

  // State management
  let isBookmarked = false; // Set to true to test the bookmarked state
  let isLoading = false;
  let progress = 0;
  let showSuccess = false;
  let pulseBookmark = true;

  // Current page info (would come from Chrome API in real extension)
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
    isBookmarked = !isBookmarked;
  }
  // Start pulse animation after component mounts
  startPulse();
</script>

<div
  in:fly={{ y: 20, duration: 400, easing: quintOut }}
  out:fade={{ duration: 200 }}
>
  <Card class="w-[350px] shadow-lg overflow-hidden border-2 border-primary/10">
    <div
      class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/30 via-primary to-primary/30 opacity-80"
    ></div>

    <CardHeader class="pb-2">
      <div class="flex justify-between items-start">
        <div class="flex items-center gap-2">
          <div class="text-lg">{currentPage.favicon}</div>
          <div>
            <CardTitle class="text-base">{currentPage.title}</CardTitle>
            <CardDescription class="text-xs truncate max-w-[250px]">
              {currentPage.url}
            </CardDescription>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          class="h-8 w-8 -mt-1 -mr-2 hover:rotate-90 transition-transform duration-200"
        >
          <X class="h-4 w-4" />
        </Button>
      </div>
    </CardHeader>

    <CardContent>
      <LoadingIndicator {isLoading} {progress} {isBookmarked} />
      <SuccessAlert {showSuccess} />
      {#if isBookmarked}
        <BookmarkCard {currentPage} {bookmarkDetails} {removeBookmark} />
      {:else}
        <NotBookmarkedAlert {currentPage} {onCancel} {onConfirm} />
      {/if}
      <RelatedBookmarks {currentPage} {relatedBookmarks} {getDomain} />
    </CardContent>

    <CardFooter class="flex justify-between pt-0">
      <Button
        variant="ghost"
        size="sm"
        class="hover:bg-primary/10 transition-colors duration-200"
      >
        <Plus class="h-3.5 w-3.5 mr-1" />
        New folder
      </Button>
      <Button
        variant="ghost"
        size="sm"
        class="hover:bg-primary/10 transition-colors duration-200"
      >
        <Save class="h-3.5 w-3.5 mr-1" />
        Settings
      </Button>
    </CardFooter>
  </Card>
</div>

<style>
  /* Custom animations */
  @keyframes shine {
    from {
      transform: translateX(-100%);
    }
    to {
      transform: translateX(100%);
    }
  }

  .animate-shine {
    animation: shine 2s infinite;
  }

  /* Progress bar styling */
  :global(.progress-value) {
    transition: width 0.3s ease;
  }
</style>
