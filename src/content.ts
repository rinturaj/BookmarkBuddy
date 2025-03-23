import Browser from "webextension-polyfill";

console.log("Content script loaded!");

// Listen for requests from popup.svelte
Browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("Message received in content script:", message);

  // if (message.type === "get-page-content") {
  capturePageData();
  // sendResponse();
  // }÷
});

if (window.location.protocol === "chrome-extension:") {
  console.log("Skipping execution inside popup.");
} else {
  const pageUrl = window.location.href;
  const pageTitle = document.title;
  const pageContent = document.body.innerText.substring(0, 500); // Limit preview

  console.log("Active Tab URL:", pageUrl);
  console.log("Page Title:", pageTitle);
  console.log("Page Content Preview:", pageContent);

  // Send data to background.js
  Browser.runtime.sendMessage({
    action: "capture_page",
    url: pageUrl,
    title: pageTitle,
    content: pageContent,
  });
}

// Function to capture webpage data
function capturePageData() {
  if (window.location.protocol === "chrome-extension:") return;

  const pageUrl = window.location.href;
  const pageTitle = document.title;
  const pageContent = document.body.innerText.substring(0, 500); // Limit preview

  console.log("Captured Page Data:", { pageUrl, pageTitle, pageContent });

  // Send data back to the popup
  Browser.runtime.sendMessage({
    action: "capture_page",
    url: pageUrl,
    title: pageTitle,
    content: pageContent,
  });
}
