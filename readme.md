# BookmarkBuddy - Chrome Extension

<div align="center">
  <img src="./public/icon/icon_transperent.png" alt="BookmarkBuddy Icon" width="128" height="128">
</div>

BookmarkBuddy is a powerful AI-based Chrome extension that helps you organize and manage your bookmarks efficiently. Leveraging artificial intelligence, it offers an intuitive interface and advanced search capabilities, ensuring you'll never lose track of your saved web pages again.

## Installation

1. Download the extension files to your computer
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top-right corner
4. Click "Load unpacked" and select the folder containing the extension files
5. The BookmarkBuddy icon should now appear in your Chrome toolbar

## How to Use BookmarkBuddy

### Adding Bookmarks

1. **Quick Bookmarking: Toolbar**

   - Click the BookmarkBuddy icon in your Chrome toolbar
   - Click "Yes" to store the bookmark
   - The current webpage will be automatically bookmarked and it will be stored under the **BookmarkBuddy** folder

2. **Manual Bookmarking: Context menu**
   - Right-click on any webpage
   - Select "Add to BookmarkBuddy" from the context menu
   - The current webpage will be automatically bookmarked and it will be stored under the **BookmarkBuddy** folder

### Searching Bookmarks

1. **Quick Search:**

   - Click the BookmarkBuddy icon
   - Type your search query in the search bar
   - Results will appear instantly as you type
   - Search by context based query

## Running the App Locally

Before installing dependencies, make sure to copy the `.env` file to the root folder of the project. This file contains environment variables required for the app to run correctly.

You can run, build, and test BookmarkBuddy locally using the following commands:

### 1. Install Dependencies

```
pnpm install
```

### 2. Start the Development Server

This will start Vite and allow hot-reloading for development:

```
pnpm run dev
```

### 3. Build for Production

To generate the optimized extension files for production:

```
pnpm run build
```

The build output will be in the `dist` folder, which you can use to load the extension in Chrome as described in the Installation section.

---

## Technical Architecture

BookmarkBuddy leverages advanced AI to enhance bookmark management and search. Below is an overview of its architecture and data flow:

### Architecture Flow Chart

```
User clicks 'Bookmark' on a webpage
              |
              v
   ┌─────────────────────────────┐
   │   Page Content Captured     │
   └─────────────────────────────┘
              |
              v
   ┌─────────────────────────────┐
   │  Meta Llama-3-8B-Instruct  │
   │  (AI Model Analysis)       │
   └─────────────────────────────┘
              |
              v
   ┌───────────────────────────────────────────────┐
   │ Extracted Details:                            │
   │ - Title                                       │
   │ - Small Description                           │
   │ - Useful Links                                │
   │ - Category                                    │
   │ - Similar Websites                            │
   └───────────────────────────────────────────────┘
              |
              v
   ┌───────────────────────────────────────────────┐
   │ Universal Sentence Encoder (TensorFlow.js)    │
   │ (Embeds extracted details into vectors)       │
   └───────────────────────────────────────────────┘
              |
              v
   ┌─────────────────────────────┐
   │   Store Details & Embeddings│
   └─────────────────────────────┘
              |
              v
   ┌─────────────────────────────┐
   │   Search & Retrieval        │
   │   (Semantic, Contextual)    │
   └─────────────────────────────┘
```

### How It Works

1. **User Action**: When a user clicks to bookmark a page, the extension sends the page content to the AI pipeline.
2. **AI Analysis (Meta Llama-3-8B-Instruct)**: The page content is analyzed using the meta/llama-3-8b-instruct pretrained model. This model extracts structured details such as:
   - Title
   - Small description
   - Useful links
   - Category
   - Similar websites
3. **Text Embedding (TensorFlow Universal Sentence Encoder)**: The extracted details are embedded into vector representations using the Universal Sentence Encoder (running offline via TensorFlow.js). These embeddings enable fast and context-aware search.
4. **Data Storage**: Both the extracted details and their embeddings are stored separately for efficient retrieval and filtering.
5. **Bookmark Search**: When searching, queries are embedded and matched against stored embeddings, enabling semantic and contextual search.

This architecture ensures BookmarkBuddy delivers smart, AI-powered bookmark management and search, all running locally in your browser for privacy and speed.

## Support

If you encounter any issues or have questions about using BookmarkBuddy:

- Check the FAQ section
- Contact support through the extension's help menu
- Visit our support website for additional resources

Happy bookmarking with BookmarkBuddy!
