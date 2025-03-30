<script lang="ts">
  import {
    Bookmark,
    Check,
    Clock,
    ExternalLink,
    Globe,
    Link2,
    Loader2,
    Plus,
    Save,
    Trash2,
    X,
  } from "lucide-svelte";

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
  import { Progress } from "$lib/components/ui/progress";
  import { Separator } from "$lib/components/ui/separator";
  import { Badge } from "$lib/components/ui/badge";
  import {
    Alert,
    AlertDescription,
    AlertTitle,
  } from "$lib/components/ui/alert";
  import * as Tooltip from "$lib/components/ui/tooltip";
  import { cn } from "$lib/utils";

  // State management
  let isBookmarked = false; // Set to true to test the bookmarked state
  let isLoading = false;
  let progress = 100;
  let showSuccess = false;

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
      progress += 5;
      if (progress >= 100) {
        clearInterval(interval);
        isLoading = false;
        isBookmarked = true;
        showSuccess = true;
        setTimeout(() => {
          showSuccess = false;
        }, 3000);
      }
    }, 50);
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
</script>

<Card class="w-[350px] shadow-lg">
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
      <Button variant="ghost" size="icon" class="h-8 w-8 -mt-1 -mr-2">
        <X class="h-4 w-4" />
      </Button>
    </div>
  </CardHeader>

  <CardContent>
    {#if isLoading}
      <div class="py-4 space-y-4">
        <div class="flex justify-center">
          <Loader2 class="h-8 w-8 animate-spin text-primary" />
        </div>
        <Progress value={progress} class="h-2 w-full" />
        <p class="text-center text-sm text-muted-foreground">
          {isBookmarked ? "Removing bookmark..." : "Adding bookmark..."}
        </p>
      </div>
    {:else if showSuccess}
      <Alert
        variant="default"
        class="bg-green-50 text-green-800 border-green-200"
      >
        <Check class="h-4 w-4 text-green-600" />
        <AlertTitle>Success!</AlertTitle>
        <AlertDescription>
          Page has been bookmarked successfully.
        </AlertDescription>
      </Alert>
    {:else if isBookmarked}
      <!-- Bookmarked state -->
      <div class="space-y-4">
        <div class="bg-muted p-3 rounded-md text-sm">
          <p class="text-muted-foreground mb-1 line-clamp-3">
            {currentPage.description}
          </p>
          <div
            class="flex items-center gap-1 text-xs text-muted-foreground mt-2"
          >
            <Clock class="h-3 w-3" />
            <span>Added on {bookmarkDetails.addedOn}</span>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-2">
          <div>
            <p class="text-xs font-medium mb-1">Folder</p>
            <Badge variant="outline" class="w-full justify-start">
              <Bookmark class="h-3 w-3 mr-1" />
              {bookmarkDetails.folder}
            </Badge>
          </div>
          <div>
            <p class="text-xs font-medium mb-1">Domain</p>
            <Badge variant="outline" class="w-full justify-start">
              <Globe class="h-3 w-3 mr-1" />
              {getDomain(currentPage.url)}
            </Badge>
          </div>
        </div>

        <div>
          <p class="text-xs font-medium mb-1">Tags</p>
          <div class="flex flex-wrap gap-1">
            {#each bookmarkDetails.tags as tag}
              <Badge variant="secondary" class="text-xs">{tag}</Badge>
            {/each}
          </div>
        </div>

        {#if bookmarkDetails.notes}
          <div>
            <p class="text-xs font-medium mb-1">Notes</p>
            <div class="bg-muted p-2 rounded-md text-xs text-muted-foreground">
              {bookmarkDetails.notes}
            </div>
          </div>
        {/if}

        <div class="flex justify-end gap-2">
          <Tooltip.Root>
            <Tooltip.Trigger>
              <Button variant="outline" size="sm" class="h-8">
                <ExternalLink class="h-3.5 w-3.5 mr-1" />
                Open
              </Button>
            </Tooltip.Trigger>
            <Tooltip.Content>
              <p class="text-xs">Open in new tab</p>
            </Tooltip.Content>
          </Tooltip.Root>
          <Tooltip.Root>
            <Tooltip.Trigger>
              <Button
                variant="destructive"
                size="sm"
                class="h-8"
                on:click={removeBookmark}
              >
                <Trash2 class="h-3.5 w-3.5 mr-1" />
                Remove
              </Button>
            </Tooltip.Trigger>
            <Tooltip.Content>
              <p class="text-xs">Remove bookmark</p>
            </Tooltip.Content>
          </Tooltip.Root>
        </div>
      </div>
    {:else}
      <!-- Not bookmarked state -->
      <div class="space-y-4">
        <Alert>
          <Bookmark class="h-4 w-4" />
          <AlertTitle>Not bookmarked</AlertTitle>
          <AlertDescription>
            Would you like to bookmark this page?
          </AlertDescription>
        </Alert>

        <div class="bg-muted p-3 rounded-md text-sm">
          <p class="text-muted-foreground mb-1 line-clamp-3">
            {currentPage.description}
          </p>
        </div>

        <div class="flex justify-end">
          <Button on:click={handleBookmark}>
            <Bookmark class="h-4 w-4 mr-2" />
            Bookmark this page
          </Button>
        </div>
      </div>
    {/if}

    <!-- Related bookmarks section -->
    {#if relatedBookmarks.length > 0}
      <Separator class="my-4" />

      <div>
        <h3 class="text-sm font-medium flex items-center gap-1 mb-2">
          <Link2 class="h-4 w-4" />
          Other bookmarks from {getDomain(currentPage.url)}
        </h3>

        <div class="space-y-2 pr-1">
          {#each relatedBookmarks as bookmark}
            <div
              class="flex items-start gap-2 p-2 hover:bg-muted rounded-md text-sm"
            >
              <Bookmark class="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
              <div>
                <p class="font-medium line-clamp-1">{bookmark.title}</p>
                <div
                  class="flex items-center gap-1 text-xs text-muted-foreground mt-1"
                >
                  <Clock class="h-3 w-3" />
                  <span>Added {bookmark.addedOn}</span>
                </div>
              </div>
            </div>
          {/each}
        </div>
      </div>
    {/if}
  </CardContent>

  <CardFooter class="flex justify-between pt-0">
    <Button variant="ghost" size="sm">
      <Plus class="h-3.5 w-3.5 mr-1" />
      New folder
    </Button>
    <Button variant="ghost" size="sm">
      <Save class="h-3.5 w-3.5 mr-1" />
      Settings
    </Button>
  </CardFooter>
</Card>
