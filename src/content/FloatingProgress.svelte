<script lang="ts">
  import Browser from "webextension-polyfill";
  import Alert from "../lib/components/ui/alert/alert.svelte";

  export let progressValue = 0;
  export let show = false;
  export let success = false;
  $: barStyle = `width: ${progressValue}%;`;

  Browser.runtime.onMessage.addListener(
    async (message, sender, sendResponse) => {
      const { type, progress } = message;

      if (type === "progress") {
        show = true;
        progressValue = progress;
        console.log("Progress:", progress);
        success = false;
      } else if (type === "done") {
        show = false;
        success = true;
        setTimeout(() => {
          success = false;
        }, 2000);
      } else if (type === "hide") {
        show = false;
        success = false;
      }
    }
  );
</script>

{#if show}
  <Alert>
    <div class="floating-progress-bar">
      <div class="progress-inner" style={barStyle}></div>
    </div>
  </Alert>
{/if}

{#if success}
  <div class="floating-success">
    <svg
      width="28"
      height="28"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#fff"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"><polyline points="20 6 9 17 4 12" /></svg
    >
    <span>Bookmark Saved!</span>
  </div>
{/if}

<style>
  .floating-progress-bar {
    position: fixed;
    top: 24px;
    right: 24px;
    width: 240px;
    height: 18px;
    background: rgba(0, 0, 0, 0.15);
    border-radius: 9px;
    z-index: 2147483647;
    overflow: hidden;
  }
  .progress-inner {
    height: 100%;
    background: #4f46e5;
    transition: width 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  }
  .floating-success {
    position: fixed;
    top: 24px;
    right: 24px;
    z-index: 2147483647;
    background: rgba(76, 175, 80, 0.95);
    color: #fff;
    font-size: 16px;
    padding: 12px 28px;
    border-radius: 20px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
    display: flex;
    align-items: center;
    gap: 10px;
    animation: fadeOut 2s 1.7s forwards;
  }
  @keyframes fadeOut {
    to {
      opacity: 0;
    }
  }
</style>
