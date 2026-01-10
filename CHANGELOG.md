# Changelog

## [Latest Update] - 2026-01-10

### New Features
- **AI-Powered Bulk Import:** You can now import your existing bookmarks from Chrome or HTML files. The AI will automatically analyze each URL, categorize it, and organize it into the appropriate folder.
- **Smart Folder Management:**
    - **Merge Duplicates:** Automatically detects and merges folders with the same name (e.g., "Dev" and "dev") to prevent clutter.
    - **Cleanup:** Automatically removes empty folders after organizing to keep your bookmark tree tidy.
- **Side Panel Integration:** Added a dedicated "Import" tab in the Side Panel for quick access to bulk importing tools without leaving your current context.

### Improvements
- **Enhanced UI/UX:**
    - Refactored the Popup menu for better navigation.
    - Added a progress bar and success animations to the import process.
    - Included a "Become a Sponsor" button for users who wish to support the project.
- **Performance:** Implemented rate limiting for imports to ensure seamless AI processing without hitting API limits.

### Fixes
- Fixed folder structure parsing for various HTML bookmark export formats.
