<script>
  import {
    ChevronRight,
    ChevronDown,
    Search,
    Bookmark,
    Folder,
    X,
    Plus,
    Save,
    Image as ImageIcon,
    FileText,
    Brain,
    StickyNote,
    ExternalLink,
    Moon,
    Sun,
  } from "lucide-svelte";

  // Import shadcn-svelte components
  import { Button } from "$lib/components/ui/button";
  import { Input } from "$lib/components/ui/input";
  import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
    CardFooter,
  } from "$lib/components/ui/card";
  import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
  } from "$lib/components/ui/tabs";
  import {
    Avatar,
    AvatarFallback,
    AvatarImage,
  } from "$lib/components/ui/avatar";
  import { Badge } from "$lib/components/ui/badge";
  import { Separator } from "$lib/components/ui/separator";
  import { Textarea } from "$lib/components/ui/textarea";
  import { Toggle } from "$lib/components/ui/toggle";
  import * as DropdownMenu from "$lib/components/ui/dropdown-menu";
  import { cn } from "$lib/utils";
  import { ModeWatcher, setMode, toggleMode } from "mode-watcher";

  // Active state management
  let activeTab = "capture"; // Options: 'capture', 'ai', 'notes'
  let selectedContent = null;

  // Sample data for active browser tabs
  const activeTabs = [
    { id: 1, title: "GitHub - Home", url: "github.com", favicon: "🌐" },
    {
      id: 2,
      title: "Documentation | Svelte",
      url: "svelte.dev/docs",
      favicon: "🌐",
    },
    {
      id: 3,
      title: "Tailwind CSS - Docs",
      url: "tailwindcss.com/docs",
      favicon: "🌐",
    },
  ];

  // Sample data for suggestions
  const suggestions = [
    { icon: "Calendar", name: "Youtube" },
    { icon: "SmilePlus", name: "Facebook" },
    { icon: "LayoutGrid", name: "Calculator" },
  ];

  // Sample data for bookmarks
  let recents = [{ url: "com.github.com", title: "GitHub", expanded: false }];

  const saved = [
    {
      url: "com.github.com",
      title: "GitHub",
      expanded: true,
      content:
        "school management platform designed to help\n\nThe best way to put ads in a Chrome extension depends on the user experience and your extension's functionality. Here are the best ad placement strategies:\n\nhttps://chatgpt.com/c/67dfd478-b954-8009-b8fb-",
    },
    { url: "svelte.dev", title: "Svelte", expanded: false },
    { url: "tailwindcss.com", title: "Tailwind CSS", expanded: false },
    { url: "vercel.com", title: "Vercel", expanded: false },
    { url: "openai.com", title: "OpenAI", expanded: false },
  ];

  // Sample captured content
  const capturedText =
    "The Chrome Extension API provides powerful features for developers to enhance the browser experience. Extensions can interact with web pages, capture content, and provide useful tools for users.";

  // Sample AI analysis
  const aiAnalysis = {
    summary:
      "This text discusses Chrome Extension API capabilities for developers.",
    keywords: ["Chrome Extension", "API", "developers", "browser experience"],
    sentiment: "Informative",
  };

  // Sample user notes
  const userNotes =
    "Remember to check the Chrome Extension documentation for security best practices. This could be useful for the BookmarkBuddy project.";

  // Toggle expansion of bookmark items
  function toggleExpand(item) {
    item.expanded = !item.expanded;
  }

  // Save current tab as bookmark
  function saveCurrentTab() {
    // In a real extension, this would interact with the Chrome API
    // For now, we'll just add a dummy entry to recents
    recents.unshift({
      url: "new-bookmark.com",
      title: "New Bookmark",
      expanded: false,
    });
    recents = recents; // Trigger reactivity
  }

  // Capture selected content
  function captureContent(type) {
    // In a real extension, this would interact with the Chrome API
    // For now, we'll just set some dummy content
    if (type === "text") {
      selectedContent = {
        type: "text",
        content: capturedText,
      };
    } else if (type === "image") {
      selectedContent = {
        type: "image",
        content: "https://placeholder.com/150x100",
      };
    }
  }

  // Clear captured content
  function clearCapturedContent() {
    selectedContent = null;
  }

  // Icon components mapping
  function getIcon(iconName) {
    switch (iconName) {
      case "Calendar":
        return `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"></rect><line x1="16" x2="16" y1="2" y2="6"></line><line x1="8" x2="8" y1="2" y2="6"></line><line x1="3" x2="21" y1="10" y2="10"></line></svg>`;
      case "SmilePlus":
        return `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5"><circle cx="12" cy="12" r="10"></circle><path d="M8 14s1.5 2 4 2 4-2 4-2"></path><line x1="9" x2="9.01" y1="9" y2="9"></line><line x1="15" x2="15.01" y1="9" y2="9"></line></svg>`;
      case "LayoutGrid":
        return `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5"><rect width="7" height="7" x="3" y="3" rx="1"></rect><rect width="7" height="7" x="14" y="3" rx="1"></rect><rect width="7" height="7" x="14" y="14" rx="1"></rect><rect width="7" height="7" x="3" y="14" rx="1"></rect></svg>`;
      default:
        return "";
    }
  }
</script>

<ModeWatcher />

<div class={`flex flex-col h-full w-full max-w-md bg-background`}>
  <!-- Header -->
  <div class="flex items-center justify-between p-4 border-b">
    <div class="flex items-center gap-3">
      <Avatar>
        <AvatarImage src="" alt="BookmarkBuddy" />
        <AvatarFallback class="bg-primary text-primary-foreground">
          <Bookmark class="w-6 h-6" />
        </AvatarFallback>
      </Avatar>
      <h1 class="text-2xl font-bold">BookmarkBuddy</h1>
    </div>
    <Button variant="ghost" size="icon" onclick={() => toggleMode()}>
      <Sun
        class="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0"
      />
      <Moon
        class="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100"
      />
    </Button>
  </div>

  <!-- Active Tabs Section -->
  <div class="px-4 py-3">
    <h2 class="text-lg font-semibold mb-2">Active Tabs</h2>
    <div class="flex flex-col space-y-2 max-h-32 overflow-y-auto">
      {#each activeTabs as tab}
        <Card class="p-0">
          <CardContent class="p-2">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <span class="text-lg">{tab.favicon}</span>
                <span class="text-sm truncate max-w-[200px]">{tab.title}</span>
              </div>
              <div class="flex items-center gap-1">
                <Button variant="ghost" size="icon" class="h-8 w-8">
                  <ExternalLink class="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  class="h-8 w-8"
                  on:click={saveCurrentTab}
                >
                  <Bookmark class="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      {/each}
    </div>
  </div>

  <!-- Search Bar -->
  <div class="px-4 mb-4 relative">
    <div class="relative">
      <Search
        class="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5"
      />
      <Input placeholder="search here" class="pl-10" />
    </div>
  </div>

  <!-- Content Capture & Analysis Section -->
  <div class="px-4 mb-4">
    <Tabs
      value={activeTab}
      onValueChange={(value) => (activeTab = value)}
      class="w-full"
    >
      <TabsList class="grid grid-cols-3 w-full">
        <TabsTrigger value="capture">Capture</TabsTrigger>
        <TabsTrigger value="ai">AI Analysis</TabsTrigger>
        <TabsTrigger value="notes">Notes</TabsTrigger>
      </TabsList>

      <TabsContent value="capture" class="mt-2">
        <Card>
          <CardHeader class="p-3 pb-0">
            <div class="flex justify-between items-center">
              <CardTitle class="text-sm">Capture Content</CardTitle>
              <div class="flex gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  class="h-8 w-8 p-0"
                  on:click={() => captureContent("text")}
                >
                  <FileText class="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  class="h-8 w-8 p-0"
                  on:click={() => captureContent("image")}
                >
                  <ImageIcon class="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent class="p-3 pt-2">
            {#if selectedContent}
              <div class="relative bg-card p-3 rounded-md border">
                <Button
                  variant="ghost"
                  size="icon"
                  class="absolute top-1 right-1 h-6 w-6 p-0"
                  on:click={clearCapturedContent}
                >
                  <X class="h-3 w-3" />
                </Button>

                {#if selectedContent.type === "text"}
                  <p class="text-sm pr-6">{selectedContent.content}</p>
                {:else if selectedContent.type === "image"}
                  <div class="flex justify-center">
                    <img
                      src={selectedContent.content || "/placeholder.svg"}
                      alt="Captured content"
                      class="max-h-32 object-contain"
                    />
                  </div>
                {/if}
              </div>
              <div class="flex justify-end mt-2">
                <Button size="sm" class="h-7">
                  <Save class="h-3 w-3 mr-1" />
                  Save
                </Button>
              </div>
            {:else}
              <div
                class="bg-muted p-3 rounded-md text-center text-sm text-muted-foreground"
              >
                Select text or an image on the page, then click capture
              </div>
            {/if}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="ai" class="mt-2">
        <Card>
          <CardHeader class="p-3 pb-0">
            <CardTitle class="text-sm flex items-center gap-1">
              <Brain class="h-4 w-4" />
              AI Analysis
            </CardTitle>
          </CardHeader>
          <CardContent class="p-3 pt-2">
            <div class="space-y-2 text-sm">
              <div>
                <span class="font-medium">Summary:</span>
                <p class="text-muted-foreground">{aiAnalysis.summary}</p>
              </div>

              <div>
                <span class="font-medium">Keywords:</span>
                <div class="flex flex-wrap gap-1 mt-1">
                  {#each aiAnalysis.keywords as keyword}
                    <Badge variant="secondary" class="text-xs">{keyword}</Badge>
                  {/each}
                </div>
              </div>

              <div>
                <span class="font-medium">Sentiment:</span>
                <span class="text-muted-foreground ml-1"
                  >{aiAnalysis.sentiment}</span
                >
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="notes" class="mt-2">
        <Card>
          <CardHeader class="p-3 pb-0">
            <div class="flex justify-between items-center">
              <CardTitle class="text-sm flex items-center gap-1">
                <StickyNote class="h-4 w-4" />
                Your Notes
              </CardTitle>
              <Button variant="ghost" size="icon" class="h-7 w-7">
                <Plus class="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent class="p-3 pt-2">
            <Textarea
              placeholder="Add your notes here..."
              class="min-h-[100px]"
              value={userNotes}
            />
            <div class="flex justify-end mt-2">
              <Button size="sm" class="h-7">
                <Save class="h-3 w-3 mr-1" />
                Save
              </Button>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  </div>

  <!-- Suggestions -->
  <div class="px-4 mb-4">
    <h2 class="text-lg font-semibold mb-2">Suggestions</h2>
    <Card>
      <CardContent class="p-2">
        {#each suggestions as suggestion}
          <div
            class="flex items-center gap-3 p-2 hover:bg-muted rounded-md cursor-pointer transition-colors"
          >
            <div class="text-foreground">
              {@html getIcon(suggestion.icon)}
            </div>
            <span>{suggestion.name}</span>
          </div>
        {/each}
      </CardContent>
    </Card>
  </div>

  <!-- Divider -->
  <Separator class="my-2" />

  <!-- Bookmarks -->
  <div class="px-4 mb-4 flex items-center justify-between">
    <div class="flex items-center gap-2">
      <Bookmark class="w-6 h-6" />
      <h2 class="text-xl font-bold">Bookmarks</h2>
    </div>
    <Button
      variant="outline"
      size="icon"
      class="h-8 w-8"
      on:click={saveCurrentTab}
    >
      <Plus class="h-4 w-4" />
    </Button>
  </div>

  <!-- Recents -->
  <div class="flex-1 overflow-auto">
    <div class="px-4 mb-2">
      <h3 class="text-lg font-semibold mb-2">Recents</h3>

      {#each recents as item}
        <div class="mb-2">
          <Card class="p-0">
            <CardContent class="p-0">
              <button
                class="w-full flex items-center justify-between p-2 text-left"
                on:click={() => toggleExpand(item)}
              >
                <div class="flex items-center gap-2">
                  <Folder class="w-5 h-5 text-muted-foreground" />
                  <div class="flex flex-col">
                    <span class="text-sm font-medium"
                      >{item.title || item.url}</span
                    >
                    <span class="text-xs text-muted-foreground">{item.url}</span
                    >
                  </div>
                </div>
                <ChevronRight class="w-5 h-5 text-muted-foreground" />
              </button>
            </CardContent>
          </Card>
        </div>
      {/each}
    </div>

    <!-- Saved -->
    <div class="px-4">
      <h3 class="text-lg font-semibold mb-2">Saved</h3>

      {#each saved as item}
        <div class="mb-2">
          <Card class="p-0">
            <CardContent class="p-0">
              <button
                class="w-full flex items-center justify-between p-2 text-left"
                on:click={() => toggleExpand(item)}
              >
                <div class="flex items-center gap-2">
                  <Folder class="w-5 h-5 text-muted-foreground" />
                  <div class="flex flex-col">
                    <span class="text-sm font-medium"
                      >{item.title || item.url}</span
                    >
                    <span class="text-xs text-muted-foreground">{item.url}</span
                    >
                  </div>
                </div>
                {#if item.expanded}
                  <ChevronDown class="w-5 h-5 text-muted-foreground" />
                {:else}
                  <ChevronRight class="w-5 h-5 text-muted-foreground" />
                {/if}
              </button>

              {#if item.expanded && item.content}
                <div
                  class="pl-8 pr-4 py-2 text-sm text-muted-foreground border-l-2 border-muted ml-3"
                >
                  {item.content}
                </div>
              {/if}
            </CardContent>
          </Card>
        </div>
      {/each}
    </div>
  </div>
</div>
