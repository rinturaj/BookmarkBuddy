import { handleEnhancedSearch } from "./enhancedSearch";
import textEmbedder from "./textEmbedder";

// Track model initialization state
let isModelInitialized = false;

// Listen for messages from the main thread
self.onmessage = async (e) => {
  const { query, bookmarks } = e.data;

  try {
    // Initialize model if not already done
    if (!isModelInitialized) {
      await textEmbedder.initialize({
        onProgress: (progress: any) => {
          // Send progress updates back to main thread
          self.postMessage({
            type: "progress",
            progress: progress.progress * 100,
            status: "Initializing model...",
          });
        },
      });
      isModelInitialized = true;
      self.postMessage({
        type: "status",
        status: "Model initialized successfully",
      });
    }

    // Send status update before starting search
    self.postMessage({
      type: "status",
      status: "Generating embeddings...",
    });

    const q = handleEnhancedSearch(query);

    console.log(q);

    // Generate query embedding
    const queryEmbedding = await textEmbedder.embedText(query);

    // Send status update before calculating similarities
    self.postMessage({
      type: "status",
      status: "Calculating similarities...",
    });

    // Calculate similarities and sort results
    const results = bookmarks
      .map((b: any) => ({
        ...b,
        score: textEmbedder.cosineSimilarity(queryEmbedding, b.embedding),
      }))
      .sort((a: any, b: any) => b.score - a.score)
      .filter((b: any) => {
        console.log("score", b.score);

        return b.score > 0.025;
      })
      .slice(0, 10);

    // Send results back to main thread
    self.postMessage({
      type: "results",
      results,
      status: "Search completed",
    });
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    self.postMessage({
      type: "error",
      error: errorMessage,
      status: "Error occurred during search",
    });
  }
};
