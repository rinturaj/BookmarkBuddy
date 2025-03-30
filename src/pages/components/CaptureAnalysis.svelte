<script>
  import {
    X,
    Plus,
    Save,
    Image as ImageIcon,
    FileText,
    Brain,
    StickyNote,
  } from "lucide-svelte";

  // Import shadcn-svelte components
  import { Button } from "$lib/components/ui/button";
  import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
  } from "$lib/components/ui/card";
  import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
  } from "$lib/components/ui/tabs";

  import { Badge } from "$lib/components/ui/badge";
  import { Textarea } from "$lib/components/ui/textarea";

  let activeTab = "capture"; // Options: 'capture', 'ai', 'notes'
  let selectedContent = null;
  // Sample data for suggestions

  // Sample data for bookmarks

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
  // Save current tab as bookmark
</script>

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
