<script lang="ts">
  import { toggleMode } from "mode-watcher";
  import {
    Avatar,
    AvatarFallback,
    AvatarImage,
  } from "$lib/components/ui/avatar";
  import { Moon, Sun } from "lucide-svelte";
  import Button from "../../lib/components/ui/button/button.svelte";
  import iconLogo from "../../../static/icon_transperent.png";
</script>

<div class="flex items-center justify-between p-4 border-b">
  <div class="flex items-center gap-3">
    <Avatar class="dark:border-primary dark:border">
      <AvatarImage src="" alt="BookmarkBuddy" />
      <AvatarFallback class="">
        <img src={iconLogo} alt="" class="p-2 rounded-2xl" srcset="" />
      </AvatarFallback>
    </Avatar>

    <h5 class="text-xl text-primary dark:text-primary-foreground font-bold">
      BookmarkBuddy
    </h5>
  </div>
  <div class="flex items-center gap-2">
    <Button variant="ghost" size="icon" onclick={() => toggleMode()}>
      <Sun
        class="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0"
      />
      <Moon
        class="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100"
      />
    </Button>
  </div>
</div>
