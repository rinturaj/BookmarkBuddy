import { writable } from "svelte/store";
import textEmbedder from "./textEmbedder";

export const bookmarks = writable<any[]>([]);

function cosineSimilarity(a: number[], b: number[]) {
  let dot = 0,
    normA = 0,
    normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

export async function loadBookmarks() {
  // dummy data (you can load from chrome.storage later)
  const list: any = [
    {
      title: "React Guide",
      url: "https://reactjs.org",
      description: "Official React hooks intro",
      createdAt: "2025-04-01",
      embedding: null,
    },
    {
      title: "Svelte Tutorial",
      url: "https://svelte.dev",
      description: "Interactive Svelte learning",
      createdAt: "2025-03-27",
      embedding: null,
    },
  ];
  await textEmbedder.initialize({
    onProgress: (progress: any) => {
      console.log(`Model loading progress: ${progress.progress * 100}%`);
    },
  });
  for (let b of list) {
    b.embedding = await callMiniLLm(`${b.title} ${b.description} `);
  }

  bookmarks.set(list);
}

export async function searchBookmarks(query: string, list: any[]) {
  const queryEmbedding = await callMiniLLm(query);
  // console.log("Query Embedding:", queryEmbedding);

  return list
    .map((b) => ({
      ...b,
      score: cosineSimilarity(queryEmbedding, b.embedding),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);
}

async function callMiniLLm(text: any) {
  // const apiKey = import.meta.env.VITE_API_KEY; // Use environment variables for security in production

  // const res = await fetch(
  //   "https://api.cloudflare.com/client/v4/accounts/bc3e2bd76b264a0fa43a0ecb31ce72e5/ai/run/@cf/baai/bge-m3",
  //   {
  //     method: "POST",
  //     body: JSON.stringify({ text: text }),
  //     headers: {
  //       Authorization: `Bearer ${apiKey}`,
  //       "Content-Type": "application/json",
  //     },
  //   }
  // );
  // const embedding = await res.json();
  // //   debugger;
  // return embedding?.result?.data[0];

  return await textEmbedder.embedText(text);
}
