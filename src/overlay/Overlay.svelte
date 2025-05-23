<script>
  import FloatingProgress from "../content/FloatingProgress.svelte";

  export let progress = 0;
  export let show = false;
  export let success = false;
</script>

<FloatingProgress {progress} {show} {success} />
