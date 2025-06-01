import { bookmarkFolders, getCategory } from "./bookmark.util";

export async function callAiapi(pageDetails: any) {
  let bookmarkBuddyFolder: any = await getCategory();
  let folders = bookmarkBuddyFolder.folders.map((x: any) => x.title);
  // Merge default bookmarkFolders with existing folders, removing duplicates
  folders = Array.from(new Set([...folders, ...bookmarkFolders]));
  const apiUrl =
    "https://api.cloudflare.com/client/v4/accounts/bc3e2bd76b264a0fa43a0ecb31ce72e5/ai/run/@cf/meta/llama-3-8b-instruct";
  const apiKey = import.meta.env.VITE_API_KEY;

  let prompt = `You are a website description bot.
     
     Write a short description (100–200 words) for the given website. Your response should include:
     
     - A clear and concise title for the website
     - A short description of what the website does or offers
     - One or more useful or important links related to the website
     - provide one or more alternative website which have the same use case as this website
     - A suitable category for the website, chosen from the following list:
       [${folders.join(", ")}]
      
     Respond in valid JSON format with the following fields:
     
     {
       "title": "Website Title Here",
       "details": "Short description of the website here.",
       "category": "Utility",
       "alternatives": ["https://example.com", "https://example.com"]
       "links": ["https://example.com/link1", "https://example.com/link2"]
     }
     `;

  const requestBody = {
    messages: [
      {
        role: "system",
        content: prompt,
      },
      {
        role: "user",
        content: pageDetails.url,
      },
    ],
  };

  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data; // Return the response data
  } catch (error) {
    console.error("API call failed:", error);
    throw error; // Rethrow the error for further handling
  }
}
