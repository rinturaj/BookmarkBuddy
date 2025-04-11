<script lang="ts">
  import {
    isSearching,
    searchResult,
    modelProgress,
    searchStatus,
  } from "../script/bookmarkStore";
  import Spinner from "./Spinner.svelte";
</script>

<div class="search-container">
  {#if $isSearching}
    <div class="search-status">
      <div class="status-content">
        <Spinner size="2rem" color="#4f46e5" />
        <div class="status-text">
          {#if $modelProgress < 100}
            <div class="progress">Loading model: {$modelProgress}%</div>
          {/if}
          <div class="status">{$searchStatus}</div>
        </div>
      </div>
    </div>
  {:else}
    {#each $searchResult as result}
      <!-- Display search results -->
    {/each}
  {/if}
</div>

<style>
  .search-container {
    padding: 1rem;
  }

  .search-status {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 200px;
  }

  .status-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
  }

  .status-text {
    text-align: center;
  }

  .progress {
    font-weight: 600;
    color: #4f46e5;
    margin-bottom: 0.5rem;
  }

  .status {
    color: #6b7280;
    font-size: 0.875rem;
  }
</style>
