<script>
  import { Search } from "lucide-svelte";

  // Import shadcn-svelte components
  import { Input } from "$lib/components/ui/input";
</script>

<!-- Search Bar -->
<div class="px-4 mb-4 relative">
  <div class="relative">
    <Search
      class="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5"
    />
    <Input placeholder="search here" class="pl-10" />
  </div>
</div>
