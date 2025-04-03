import Browser from "webextension-polyfill";

console.log("Content script loaded!");

// Listen for requests from popup.svelte
Browser.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  console.log("Message received in content script:", message);

  // if (message.type === "get-page-content") {
  capturePageData();
  // sendResponse();
  // }÷

  console.log(message);

  if (message.action === "openSidePanel") {
    await chrome.sidePanel.open({ tabId: message?.id || 0 });
  }
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

// // Wait for the page to fully load
// window.addEventListener("load", () => {
//   let button = document.createElement("button");
//   button.innerText = "★ Bookmark";
//   button.style.position = "fixed";
//   button.style.top = "100px";
//   button.style.right = "0px";
//   button.style.zIndex = "1000";
//   button.style.background = "#ffcc00";
//   button.style.border = "none";
//   button.style.padding = "8px 12px";
//   button.style.cursor = "pointer";
//   button.style.fontSize = "14px";
//   button.style.borderRadius = "6px";

//   document.body.appendChild(button);

//   button.addEventListener("click", () => {
//     chrome.runtime.sendMessage({
//       action: "addBookmark",
//       url: window.location.href,
//       title: document.title,
//     });
//   });
// });
