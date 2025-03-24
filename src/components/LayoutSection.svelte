<script>
  import Footer from "./Footer.svelte";
  import { onMount } from "svelte";
  import { fade, slide } from "svelte/transition";
  import { quintOut } from "svelte/easing";
  import iconLogo from "../../static/128.png";
  import Header from "./header.svelte";

  // State management
  let bookmarks = [];
  let categories = [];
  let searchQuery = "";
  let searchResults = [];
  let currentUrl = "";
  let currentTitle = "";
  let currentDescription = "";
  let currentFavicon = "";
  let isBookmarked = false;
  let showAddSuccess = false;
  let activeTab = "categories"; // 'categories', 'all', or 'search'
  let expandedCategories = new Set();
  let selectedCategory = null;
  let editingCategory = null;
  let newCategoryName = "";
  let showCategoryModal = false;
  let draggedBookmark = null;
  let dropTargetCategory = null;
  let searchCategory = "all";

  // Default categories
  const defaultCategories = [
    { id: "uncategorized", name: "Uncategorized", color: "gray" },
    { id: "work", name: "Work", color: "blue" },
    { id: "personal", name: "Personal", color: "green" },
    { id: "shopping", name: "Shopping", color: "pink" },
    { id: "research", name: "Research", color: "purple" },
  ];

  // Category colors
  const categoryColors = {
    gray: "bg-gray-100 text-gray-800",
    blue: "bg-blue-100 text-blue-800",
    green: "bg-green-100 text-green-800",
    red: "bg-red-100 text-red-800",
    yellow: "bg-yellow-100 text-yellow-800",
    purple: "bg-purple-100 text-purple-800",
    pink: "bg-pink-100 text-pink-800",
    indigo: "bg-indigo-100 text-indigo-800",
  };

  // Load bookmarks and categories on mount
  onMount(async () => {
    try {
      // Simulate browser.tabs.query in a real extension
      const tabs = await simulateGetCurrentTab();
      currentUrl = tabs.url;
      currentTitle = tabs.title;

      // Get meta description (would be done via content script in real extension)
      currentDescription =
        document.querySelector('meta[name="description"]')?.content || "";

      // Get favicon (would be done via content script in real extension)
      currentFavicon = getFavicon();

      // Load saved bookmarks and categories (would use browser.storage.local in real extension)
      const savedBookmarks = localStorage.getItem("bookmarks");
      const savedCategories = localStorage.getItem("categories");

      if (savedBookmarks) {
        bookmarks = JSON.parse(savedBookmarks);
        isBookmarked = bookmarks.some(
          (bookmark) => bookmark.url === currentUrl
        );
      }

      if (savedCategories) {
        categories = JSON.parse(savedCategories);
      } else {
        // Initialize with default categories if none exist
        categories = defaultCategories;
        saveCategories();
      }

      // Expand the first category by default
      if (categories.length > 0) {
        expandedCategories.add(categories[0].id);
        expandedCategories = expandedCategories;
      }
    } catch (error) {
      console.error("Error initializing extension:", error);
    }
  });

  // Simulate getting current tab (in a real extension, this would use browser.tabs API)
  function simulateGetCurrentTab() {
    return Promise.resolve({
      url: window.location.href || "https://example.com/page",
      title: document.title || "Example Page Title",
    });
  }

  // Get favicon URL
  function getFavicon() {
    const linkElement =
      document.querySelector('link[rel="icon"]') ||
      document.querySelector('link[rel="shortcut icon"]');
    if (linkElement) {
      return linkElement.href;
    }
    // Default to website favicon
    return new URL("/favicon.ico", window.location.origin).href;
  }

  // Save bookmarks to storage
  function saveBookmarks() {
    localStorage.setItem("bookmarks", JSON.stringify(bookmarks));
  }

  // Save categories to storage
  function saveCategories() {
    localStorage.setItem("categories", JSON.stringify(categories));
  }

  // Add current page as bookmark
  async function addBookmark() {
    if (isBookmarked) return;

    try {
      // In a real extension, we would extract links via content script
      const links = Array.from(document.querySelectorAll("a"))
        .map((a) => ({ text: a.textContent.trim(), href: a.href }))
        .filter((link) => link.text && link.href)
        .slice(0, 20); // Limit to 20 links for performance

      const newBookmark = {
        id: Date.now(),
        url: currentUrl,
        title: currentTitle,
        description: currentDescription,
        favicon: currentFavicon,
        dateAdded: new Date().toISOString(),
        links: links,
        categoryId: selectedCategory || "uncategorized",
        tags: [],
      };

      bookmarks = [newBookmark, ...bookmarks];
      saveBookmarks();
      isBookmarked = true;

      // Show success message
      showAddSuccess = true;
      setTimeout(() => {
        showAddSuccess = false;
      }, 2000);
    } catch (error) {
      console.error("Error adding bookmark:", error);
    }
  }

  // Remove bookmark
  function removeBookmark() {
    if (!isBookmarked) return;

    bookmarks = bookmarks.filter((bookmark) => bookmark.url !== currentUrl);
    saveBookmarks();
    isBookmarked = false;
  }

  // Search bookmarks
  function search() {
    if (!searchQuery.trim()) {
      searchResults = [];
      activeTab = "categories";
      return;
    }

    const query = searchQuery.toLowerCase();

    // Filter by category if one is selected
    let filteredBookmarks = bookmarks;
    if (searchCategory !== "all") {
      filteredBookmarks = bookmarks.filter(
        (bookmark) => bookmark.categoryId === searchCategory
      );
    }

    searchResults = filteredBookmarks.filter(
      (bookmark) =>
        bookmark.title.toLowerCase().includes(query) ||
        bookmark.description.toLowerCase().includes(query) ||
        bookmark.links.some((link) => link.text.toLowerCase().includes(query))
    );

    activeTab = "search";
  }

  // Format date for display
  function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }

  // Handle search input
  function handleSearchInput() {
    if (searchQuery.trim()) {
      search();
    } else {
      activeTab = "categories";
      searchResults = [];
    }
  }

  // Toggle category expansion
  function toggleCategory(categoryId) {
    if (expandedCategories.has(categoryId)) {
      expandedCategories.delete(categoryId);
    } else {
      expandedCategories.add(categoryId);
    }
    expandedCategories = expandedCategories; // Trigger reactivity
  }

  // Get bookmarks for a category
  function getBookmarksForCategory(categoryId) {
    return bookmarks.filter((bookmark) => bookmark.categoryId === categoryId);
  }

  // Create a new category
  function createCategory() {
    if (!newCategoryName.trim()) return;

    const newCategory = {
      id: "category_" + Date.now(),
      name: newCategoryName,
      color: getRandomColor(),
    };

    categories = [...categories, newCategory];
    saveCategories();
    newCategoryName = "";
    showCategoryModal = false;

    // Expand the new category
    expandedCategories.add(newCategory.id);
    expandedCategories = expandedCategories;
  }

  // Get a random color for new categories
  function getRandomColor() {
    const colors = Object.keys(categoryColors);
    return colors[Math.floor(Math.random() * colors.length)];
  }

  // Start editing a category
  function startEditCategory(category) {
    editingCategory = category;
    newCategoryName = category.name;
  }

  // Save category edit
  function saveEditCategory() {
    if (!newCategoryName.trim() || !editingCategory) return;

    categories = categories.map((cat) =>
      cat.id === editingCategory.id ? { ...cat, name: newCategoryName } : cat
    );

    saveCategories();
    newCategoryName = "";
    editingCategory = null;
  }

  // Delete a category
  function deleteCategory(categoryId) {
    // Don't allow deleting the uncategorized category
    if (categoryId === "uncategorized") return;

    // Move all bookmarks from this category to uncategorized
    bookmarks = bookmarks.map((bookmark) =>
      bookmark.categoryId === categoryId
        ? { ...bookmark, categoryId: "uncategorized" }
        : bookmark
    );

    // Remove the category
    categories = categories.filter((cat) => cat.id !== categoryId);

    saveBookmarks();
    saveCategories();

    // Remove from expanded categories
    if (expandedCategories.has(categoryId)) {
      expandedCategories.delete(categoryId);
      expandedCategories = expandedCategories;
    }
  }

  // Move a bookmark to a different category
  function moveBookmark(bookmarkId, targetCategoryId) {
    bookmarks = bookmarks.map((bookmark) =>
      bookmark.id === bookmarkId
        ? { ...bookmark, categoryId: targetCategoryId }
        : bookmark
    );

    saveBookmarks();
  }

  // Handle drag start
  function handleDragStart(bookmark) {
    draggedBookmark = bookmark;
  }

  // Handle drag over
  function handleDragOver(categoryId, event) {
    event.preventDefault();
    dropTargetCategory = categoryId;
  }

  // Handle drop
  function handleDrop(categoryId, event) {
    event.preventDefault();
    if (draggedBookmark && draggedBookmark.categoryId !== categoryId) {
      moveBookmark(draggedBookmark.id, categoryId);
    }
    draggedBookmark = null;
    dropTargetCategory = null;
  }

  // Get category name by ID
  function getCategoryName(categoryId) {
    const category = categories.find((cat) => cat.id === categoryId);
    return category ? category.name : "Uncategorized";
  }

  // Get category color class by ID
  function getCategoryColorClass(categoryId) {
    const category = categories.find((cat) => cat.id === categoryId);
    return category ? categoryColors[category.color] : categoryColors.gray;
  }

  // Cancel category editing or creation
  function cancelCategoryEdit() {
    editingCategory = null;
    newCategoryName = "";
    showCategoryModal = false;
  }
</script>

<div
  class="w-[400px] h-[600px] bg-white text-gray-800 flex flex-col overflow-hidden"
>
  <!-- Header -->
  <Header></Header>

  <!-- Success message -->
  {#if showAddSuccess}
    <div
      transition:fade
      class="bg-green-100 text-green-800 px-4 py-2 text-center"
    >
      Page bookmarked successfully!
    </div>
  {/if}

  <!-- Main content -->
  <main class="flex-1 overflow-y-auto">
    {#if activeTab === "categories"}
      <div class="p-4">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-lg font-semibold">Categories</h2>
          <button
            on:click={() => (showCategoryModal = true)}
            class="text-sm text-emerald-500 hover:text-emerald-600 flex items-center"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-4 w-4 mr-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 4v16m8-8H4"
              />
            </svg>
            New Category
          </button>
        </div>

        {#if categories.length === 0}
          <div class="text-center text-gray-500 py-8">
            No categories yet. Create your first category!
          </div>
        {:else}
          <div class="space-y-2">
            {#each categories as category}
              <div
                role="list"
                class="border border-gray-200 rounded-lg overflow-hidden"
                on:dragover={(e) => handleDragOver(category.id, e)}
                on:drop={(e) => handleDrop(category.id, e)}
                class:border-emerald-300={dropTargetCategory === category.id}
              >
                <div
                  role="none"
                  class="flex items-center justify-between p-3 cursor-pointer hover:bg-gray-50"
                  on:click={() => toggleCategory(category.id)}
                >
                  <div class="flex items-center">
                    <div
                      class={`w-3 h-3 rounded-full mr-3 ${categoryColors[category.color]}`}
                    ></div>
                    <span class="font-medium">{category.name}</span>
                    <span class="ml-2 text-xs text-gray-500">
                      ({getBookmarksForCategory(category.id).length})
                    </span>
                  </div>

                  <div class="flex items-center space-x-2">
                    {#if category.id !== "uncategorized"}
                      <button
                        aria-label="Edit"
                        on:click={(e) => {
                          e.stopPropagation();
                          startEditCategory(category);
                        }}
                        class="text-gray-400 hover:text-gray-600"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          class="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                          />
                        </svg>
                      </button>

                      <button
                        aria-label="Delete"
                        on:click={(e) => {
                          e.stopPropagation();
                          deleteCategory(category.id);
                        }}
                        class="text-gray-400 hover:text-red-500"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          class="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    {/if}

                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      class="h-5 w-5 text-gray-400 transform transition-transform duration-200"
                      class:rotate-180={expandedCategories.has(category.id)}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                </div>

                {#if expandedCategories.has(category.id)}
                  <div transition:slide={{ duration: 200, easing: quintOut }}>
                    {#if getBookmarksForCategory(category.id).length === 0}
                      <div
                        class="px-4 py-3 text-sm text-gray-500 border-t border-gray-100"
                      >
                        No bookmarks in this category yet.
                      </div>
                    {:else}
                      <div class="border-t border-gray-100">
                        {#each getBookmarksForCategory(category.id) as bookmark}
                          <div
                            role="listitem"
                            class="p-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 flex items-start"
                            draggable="true"
                            on:dragstart={() => handleDragStart(bookmark)}
                          >
                            <div class="flex-shrink-0 mr-3">
                              {#if bookmark.favicon}
                                <img
                                  src={bookmark.favicon || "/placeholder.svg"}
                                  alt="favicon"
                                  class="w-4 h-4"
                                />
                              {:else}
                                <div class="w-4 h-4 bg-gray-200 rounded"></div>
                              {/if}
                            </div>
                            <div class="flex-1 min-w-0">
                              <a
                                href={bookmark.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                class="block font-medium text-sm text-emerald-600 hover:underline truncate"
                              >
                                {bookmark.title}
                              </a>
                              {#if bookmark.description}
                                <p
                                  class="text-xs text-gray-500 line-clamp-1 mt-1"
                                >
                                  {bookmark.description}
                                </p>
                              {/if}
                              <div class="flex items-center mt-1">
                                <span class="text-xs text-gray-400"
                                  >{formatDate(bookmark.dateAdded)}</span
                                >

                                <!-- Category badge for drag hint -->
                                <div
                                  class="ml-2 text-xs px-1.5 py-0.5 rounded-full {getCategoryColorClass(
                                    bookmark.categoryId
                                  )}"
                                >
                                  {getCategoryName(bookmark.categoryId)}
                                </div>
                              </div>
                            </div>

                            <!-- Bookmark actions dropdown -->
                            <div class="relative group">
                              <button
                                aria-label="dropdown"
                                class="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  class="h-4 w-4"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    stroke-width="2"
                                    d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                                  />
                                </svg>
                              </button>

                              <!-- Dropdown menu (simplified for this example) -->
                              <div
                                class="hidden group-hover:block absolute right-0 top-6 w-48 bg-white shadow-lg rounded-md border border-gray-200 z-10"
                              >
                                <div class="py-1">
                                  <div
                                    class="px-3 py-2 text-xs font-semibold text-gray-500 border-b border-gray-100"
                                  >
                                    Move to category
                                  </div>
                                  {#each categories.filter((cat) => cat.id !== bookmark.categoryId) as category}
                                    <button
                                      on:click={() =>
                                        moveBookmark(bookmark.id, category.id)}
                                      class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                    >
                                      <div class="flex items-center">
                                        <div
                                          class={`w-2 h-2 rounded-full mr-2 ${categoryColors[category.color]}`}
                                        ></div>
                                        {category.name}
                                      </div>
                                    </button>
                                  {/each}
                                </div>
                              </div>
                            </div>
                          </div>
                        {/each}
                      </div>
                    {/if}
                  </div>
                {/if}
              </div>
            {/each}
          </div>
        {/if}
      </div>
    {:else if activeTab === "search"}
      <div class="p-4">
        <h2 class="text-lg font-semibold mb-4">
          Search Results ({searchResults.length})
          {#if searchCategory !== "all"}
            <span class="text-sm font-normal text-gray-500">
              in {getCategoryName(searchCategory)}
            </span>
          {/if}
        </h2>

        {#if searchResults.length === 0}
          <div class="text-center text-gray-500 py-8">
            No results found for "{searchQuery}"
          </div>
        {:else}
          <div class="space-y-4">
            {#each searchResults as result}
              <div
                class="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
              >
                <div class="flex items-start">
                  <div class="flex-shrink-0 mr-3 mt-1">
                    {#if result.favicon}
                      <img
                        src={result.favicon || "/placeholder.svg"}
                        alt="favicon"
                        class="w-4 h-4"
                      />
                    {:else}
                      <div class="w-4 h-4 bg-gray-200 rounded"></div>
                    {/if}
                  </div>

                  <div class="flex-1">
                    <div class="flex items-center justify-between">
                      <h3 class="font-medium text-emerald-600 line-clamp-1">
                        <a
                          href={result.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          class="hover:underline"
                        >
                          {result.title}
                        </a>
                      </h3>

                      <div
                        class="text-xs px-2 py-1 rounded-full {getCategoryColorClass(
                          result.categoryId
                        )}"
                      >
                        {getCategoryName(result.categoryId)}
                      </div>
                    </div>

                    <p class="text-sm text-gray-500 mb-2 truncate">
                      {result.url}
                    </p>

                    {#if result.description}
                      <p class="text-sm text-gray-700 mb-2 line-clamp-2">
                        {result.description}
                      </p>
                    {/if}

                    <!-- Show matching links if any -->
                    {#if result.links && result.links.some((link) => link.text
                          .toLowerCase()
                          .includes(searchQuery.toLowerCase()))}
                      <div class="mt-2 border-t border-gray-100 pt-2">
                        <p class="text-xs font-medium text-gray-700 mb-1">
                          Matching links:
                        </p>
                        <ul class="text-xs text-gray-600 space-y-1">
                          {#each result.links
                            .filter((link) => link.text
                                .toLowerCase()
                                .includes(searchQuery.toLowerCase()))
                            .slice(0, 3) as link}
                            <li class="truncate">
                              <a
                                href={link.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                class="hover:underline text-emerald-500"
                              >
                                {link.text}
                              </a>
                            </li>
                          {/each}
                        </ul>
                      </div>
                    {/if}

                    <div class="flex justify-between items-center mt-2">
                      <span class="text-xs text-gray-500"
                        >Added {formatDate(result.dateAdded)}</span
                      >
                    </div>
                  </div>
                </div>
              </div>
            {/each}
          </div>
        {/if}
      </div>
    {/if}
  </main>

  <Footer></Footer>
  <!-- Category modal -->
  {#if showCategoryModal || editingCategory}
    <div
      class="fixed inset-0 bg-gray-100 bg-blend-overlay bg-opacity-10 flex items-center justify-center z-50"
    >
      <div
        class="bg-white rounded-lg shadow-lg w-72 p-4"
        transition:fade={{ duration: 150 }}
      >
        <h3 class="text-lg font-semibold mb-4">
          {editingCategory ? "Edit Category" : "Create New Category"}
        </h3>

        <div class="mb-4">
          <label
            for="categoryName"
            class="block text-sm font-medium text-gray-700 mb-1"
          >
            Category Name
          </label>
          <input
            type="text"
            id="categoryName"
            bind:value={newCategoryName}
            placeholder="Enter category name"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          />
        </div>

        <div class="flex justify-end space-x-2">
          <button
            on:click={cancelCategoryEdit}
            class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
          >
            Cancel
          </button>

          <button
            on:click={editingCategory ? saveEditCategory : createCategory}
            class="px-4 py-2 text-sm font-medium text-white bg-emerald-500 hover:bg-emerald-600 rounded-md transition-colors"
          >
            {editingCategory ? "Save Changes" : "Create Category"}
          </button>
        </div>
      </div>
    </div>
  {/if}
</div>

<style>
  /* Additional styles that complement Tailwind */
  :global(body) {
    margin: 0;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen,
      Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
  }

  .line-clamp-1 {
    display: -webkit-box;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .line-clamp-2 {
    display: -webkit-box;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
</style>
