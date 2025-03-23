<script>
  import header from "./header.svelte";

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

<!-- Footer -->
<footer
  class="bg-gray-50 border-t border-gray-200 p-3 text-center text-xs text-gray-500"
>
  BookmarkPro Extension • Organize your web efficiently
</footer>

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
