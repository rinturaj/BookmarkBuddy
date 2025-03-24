<script lang="ts">
  import Browser from "webextension-polyfill";
  import { on } from "svelte/events";
  import { onMount } from "svelte";
  import { pipeline } from "@xenova/transformers";
  import LayoutSection from "../components/LayoutSection.svelte";

  let pageContent: any = {};
  let selectedText: any = "";
  let result: any;
  // let pipe: any;

  // async function loadPipe() {
  //   pipe = await pipeline("summarization", "Mozilla/distilbart-cnn-12-6");
  // }
  onMount(async () => {
    // await loadPipe();
    Browser.tabs
      .query({ active: true, currentWindow: true })
      .then((tabs: any[]) => {
        console.log(tabs);

        // Browser.tabs.sendMessage(tabs[0].id, { type: "get-page-content" });
      });

    Browser.storage.local.get("text").then(async (data) => {
      console.log(data);

      if (data) {
        selectedText = data.text;
        // result = await pipe(selectedText, 150, 50, false);
        // console.log(result);
      }
    });
  });

  Browser.runtime.onMessage.addListener(
    async (message, sender, sendResponse) => {
      console.log("On Popup received:", message);
      if (message.action === "capture_page") {
        pageContent = message;
        // result = await pipe(message.content, 150, 50, false);
        // console.log(result);
      }
      // pageContent = message;
    }
  );
</script>

<div>
  <h2>Page Info</h2>
  <button
    on:click={() => {
      Browser.tabs
        .query({ active: true, currentWindow: true })
        .then((tabs: any[]) => {
          console.log(tabs);

          Browser.tabs.sendMessage(tabs[0].id, { type: "get-page-content" });
        });
    }}
  >
    click
  </button>
  <p><strong>Title:</strong> {pageContent?.title}</p>
  <p><strong>URL:</strong> {pageContent?.url}</p>
  <p><strong>Text:</strong> {pageContent?.text}</p>
  <p><strong>Text:</strong> {pageContent?.content}</p>
  <p><strong>selectedText:</strong> {selectedText}</p>
  <p><strong>Result:</strong> {result?.pop()?.label}</p>
  <LayoutSection></LayoutSection>
</div>

<style>
</style>
