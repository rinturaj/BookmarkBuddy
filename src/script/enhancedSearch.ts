// Add this function to the BookmarkSearch.svelte component
import * as tf from "@tensorflow/tfjs";
import * as use from "@tensorflow-models/universal-sentence-encoder";

export let model: any;

// Enhanced search function with time filtering capability
export async function handleEnhancedSearch(
  searchQuery: string,
  searchResults: any[]
) {
  if (!searchQuery.trim()) {
    searchResults = [];
    return;
  }

  // Extract time references from query
  const timeReference = extractTimeReference(searchQuery);
  const cleanedQuery = removeTimeReferences(searchQuery);

  // Get date range based on time reference
  const dateRange = getDateRangeFromReference(timeReference);

  console.log("Date Range:", dateRange);
  console.log("Cleaned Query:", cleanedQuery);
  console.log("Time Reference:", timeReference);
  // Perform keyword search using Fuse.js

  //   // Perform basic keyword search with Fuse.js
  //   const keywordResults = Fuse.search(cleanedQuery);

  //   // If model is loaded, perform semantic search
  //   let semanticResults = [];
  //   if (model && !isModelLoading) {
  //     try {
  //       // Get query embedding
  //       const queryEmbedding = await model.embed(cleanedQuery);
  //       const queryVector = await queryEmbedding.array();

  //       // Calculate semantic similarity scores
  //       semanticResults = bookmarks
  //         .filter((bookmark) => embeddings[bookmark.id]) // Only compare bookmarks with embeddings
  //         .map((bookmark) => {
  //           const similarity = cosineSimilarity(
  //             queryVector[0],
  //             embeddings[bookmark.id]
  //           );
  //           return {
  //             item: bookmark,
  //             score: 1 - similarity, // Convert similarity to distance (lower is better)
  //             type: "semantic",
  //           };
  //         })
  //         .sort((a, b) => a.score - b.score)
  //         .slice(0, 20);
  //     } catch (error) {
  //       console.error("Error during semantic search:", error);
  //     }
  //   }

  //   // Combine results
  //   let combinedResults = mergeResults(keywordResults, semanticResults);

  //   // Apply time filter if specified
  //   if (dateRange) {
  //     combinedResults = combinedResults.filter((result) => {
  //       // Get bookmark date from Chrome API data or our stored metadata
  //       // This assumes you've stored the dateAdded property from Chrome's bookmarks
  //       const bookmarkDate = new Date(result.item.dateAdded || Date.now());
  //       return bookmarkDate >= dateRange.start && bookmarkDate <= dateRange.end;
  //     });
  //   }

  //   searchResults = combinedResults.slice(0, 15); // Limit to top 15 results
}

// Extract time references like "last week", "yesterday", etc.
function extractTimeReference(query: string) {
  const timePatterns = [
    { regex: /last\s+week/i, type: "last_week" },
    { regex: /this\s+week/i, type: "this_week" },
    { regex: /last\s+month/i, type: "last_month" },
    { regex: /this\s+month/i, type: "this_month" },
    { regex: /yesterday/i, type: "yesterday" },
    { regex: /today/i, type: "today" },
    { regex: /recently/i, type: "this_month" },
    { regex: /(\d+)\s+days?\s+ago/i, type: "days_ago" },
  ];

  for (const pattern of timePatterns) {
    const match = query.match(pattern.regex);
    if (match) {
      if (pattern.type === "days_ago" && match[1]) {
        return { type: pattern.type, value: parseInt(match[1]) };
      }
      return { type: pattern.type };
    }
  }

  return null;
}

// Remove time references from query for better semantic matching
function removeTimeReferences(query: string) {
  return query
    .replace(/last\s+week/i, "")
    .replace(/this\s+week/i, "")
    .replace(/last\s+month/i, "")
    .replace(/this\s+month/i, "")
    .replace(/yesterday/i, "")
    .replace(/today/i, "")
    .replace(/recently/i, "")
    .replace(/(\d+)\s+days?\s+ago/i, "")
    .replace(/\s+/g, " ")
    .trim();
}

// Convert time reference to actual date range
function getDateRangeFromReference(timeRef: any) {
  if (!timeRef) return null;

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  switch (timeRef.type) {
    case "last_week": {
      const start = new Date(today);
      start.setDate(start.getDate() - 7 - today.getDay());
      const end = new Date(start);
      end.setDate(end.getDate() + 6);
      return { start, end };
    }
    case "this_week": {
      const start = new Date(today);
      start.setDate(start.getDate() - today.getDay());
      const end = new Date(start);
      end.setDate(end.getDate() + 6);
      return { start, end };
    }
    case "last_month": {
      const start = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      const end = new Date(today.getFullYear(), today.getMonth(), 0);
      return { start, end };
    }
    case "this_month": {
      const start = new Date(today.getFullYear(), today.getMonth(), 1);
      const end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      return { start, end };
    }
    case "yesterday": {
      const start = new Date(today);
      start.setDate(start.getDate() - 1);
      return { start, end: start };
    }
    case "today": {
      return { start: today, end: today };
    }
    case "days_ago": {
      const start = new Date(today);
      start.setDate(start.getDate() - timeRef.value);
      return { start, end: start };
    }
    default:
      return null;
  }
}
