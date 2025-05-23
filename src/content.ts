import Browser from "webextension-polyfill";
import { ACTION } from "./const";
import { mount } from "svelte";
import Overlay from "./overlay/Overlay.svelte";
import "tailwindcss/tailwind.css";

console.log("Content script loaded!");
mount(Overlay, { target: document.body });

Browser.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  capturePageData();

  if (message.action === ACTION.OPEN_SIDEPANEL) {
    await chrome.sidePanel.open({ tabId: message?.id || 0 });
  }
  if (message.action == ACTION.GET_CONTENT) {
  }
});

if (window.location.protocol !== "chrome-extension:") {
  capturePageData();
}

// Function to capture webpage data
function capturePageData() {
  if (window.location.protocol === "chrome-extension:") return;
  const pageUrl = window.location.href;
  const pageTitle = document.title;
  const pageContent = document.body.innerText.substring(0, 500); // Limit preview
  Browser.runtime.sendMessage({
    action: ACTION.CAPTURE_CONTENT,
    url: pageUrl,
    title: pageTitle,
    content: pageContent,
  });
}
