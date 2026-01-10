<script lang="ts">
    import { Button } from "$lib/components/ui/button";
    import {
        Card,
        CardContent,
        CardTitle,
        CardHeader,
    } from "$lib/components/ui/card";
    import { Progress } from "$lib/components/ui/progress";
    import {
        Upload,
        FileUp,
        Loader2,
        CheckCircle,
        AlertCircle,
    } from "lucide-svelte";
    import Browser from "webextension-polyfill";
    import { fade, scale } from "svelte/transition";
    import { mergeDuplicateFolders } from "../../script/bookmark.util";
    import { onMount } from "svelte";

    let fileInput: HTMLInputElement;
    let selectedFile: File | null = null;
    let isDragging = false;
    let isLoading = false;
    let importStatus = "";
    let importedCount = 0;
    let totalBookmarks = 0;
    let progressValue = 0;
    let isComplete = false;

    // Limit logic
    let limitReached = false;
    let usageCount = 0;
    const MONTHLY_LIMIT = 3;

    onMount(async () => {
        await checkLimit();
    });

    async function checkLimit() {
        const data = await Browser.storage.local.get("bulkImportUsage");
        const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM

        let usage = data.bulkImportUsage || { count: 0, month: currentMonth };

        if (usage.month !== currentMonth) {
            // New month, reset
            usage = { count: 0, month: currentMonth };
            await Browser.storage.local.set({ bulkImportUsage: usage });
        }

        usageCount = usage.count;
        if (usageCount >= MONTHLY_LIMIT) {
            limitReached = true;
        }
    }

    async function incrementUsage() {
        const currentMonth = new Date().toISOString().slice(0, 7);
        const newCount = usageCount + 1;
        await Browser.storage.local.set({
            bulkImportUsage: { count: newCount, month: currentMonth },
        });
        usageCount = newCount;
        if (usageCount >= MONTHLY_LIMIT) {
            limitReached = true;
        }
    }

    function handleDragOver(e: DragEvent) {
        if (isLoading || isComplete || limitReached) return;
        e.preventDefault();
        isDragging = true;
    }

    function handleDragLeave(e: DragEvent) {
        if (isLoading || isComplete || limitReached) return;
        e.preventDefault();
        isDragging = false;
    }

    function handleDrop(e: DragEvent) {
        if (isLoading || isComplete || limitReached) return;
        e.preventDefault();
        isDragging = false;
        if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
            validateAndSetFile(e.dataTransfer.files[0]);
        }
    }

    function handleFileSelect(e: Event) {
        const target = e.target as HTMLInputElement;
        if (target.files && target.files.length > 0) {
            validateAndSetFile(target.files[0]);
        }
    }

    function validateAndSetFile(file: File) {
        if (file.type === "text/html" || file.name.endsWith(".html")) {
            selectedFile = file;
            importStatus = "";
            isComplete = false; // Reset complete status if a new file is selected
        } else {
            alert("Please select a valid HTML bookmark file.");
        }
    }

    function resetImport() {
        selectedFile = null;
        isLoading = false;
        importStatus = "";
        importedCount = 0;
        totalBookmarks = 0;
        progressValue = 0;
        isComplete = false;
        if (fileInput) fileInput.value = "";
    }

    async function processImport() {
        console.log("Processing import...");
        if (!selectedFile) return;

        isLoading = true;
        isComplete = false;
        importStatus = "Reading file...";
        importedCount = 0;
        totalBookmarks = 0;
        progressValue = 0;

        try {
            const text = await selectedFile.text();
            const parser = new DOMParser();
            const doc = parser.parseFromString(text, "text/html");

            // Extract all links first
            const bookmarksToImport: { title: string; url: string }[] = [];

            // Helper to recurse and collect links
            const collectLinks = (element: Element) => {
                const children = Array.from(element.children);
                for (const child of children) {
                    if (child.tagName === "DT") {
                        const a = child.querySelector(":scope > a");
                        const dl = child.querySelector(":scope > dl");

                        if (a) {
                            const anchor = a as HTMLAnchorElement;
                            const title = anchor.textContent || "Untitled";
                            const url = anchor.href;
                            if (isValidUrl(url)) {
                                bookmarksToImport.push({ title, url });
                            }
                        }
                        if (dl) {
                            collectLinks(dl);
                        }
                    } else if (child.tagName === "DL") {
                        collectLinks(child);
                    } else if (child.tagName === "A") {
                        // Handle flat structure or direct links
                        const anchor = child as HTMLAnchorElement;
                        if (isValidUrl(anchor.href)) {
                            bookmarksToImport.push({
                                title: anchor.textContent || "Untitled",
                                url: anchor.href,
                            });
                        }
                    }
                }
            };

            const rootDl = doc.querySelector("dl");
            if (rootDl) {
                collectLinks(rootDl);
            } else {
                // Fallback for flat files
                const links = doc.getElementsByTagName("a");
                for (let i = 0; i < links.length; i++) {
                    const link = links[i];
                    if (isValidUrl(link.href)) {
                        bookmarksToImport.push({
                            title: link.textContent || "Untitled",
                            url: link.href,
                        });
                    }
                }
            }

            totalBookmarks = bookmarksToImport.length;
            if (totalBookmarks === 0) {
                importStatus = "No bookmarks found in file.";
                isLoading = false;
                return;
            }

            importStatus = `Found ${totalBookmarks} bookmarks. Importing (with AI Analysis)...`;

            // Process one by one to allow AI analysis to keep up/not rate limit
            for (let i = 0; i < totalBookmarks; i++) {
                const { title, url } = bookmarksToImport[i];
                importStatus = `Importing: ${title.slice(0, 30)}...`;

                try {
                    // Create in root ("1") to trigger AI Analysis & Organization
                    // Referencing src/components/common/AiAnalysis.svelte
                    await Browser.bookmarks.create({
                        parentId: "1",
                        title: title,
                        url: url,
                    });
                    importedCount++;
                    progressValue = (importedCount / totalBookmarks) * 100;

                    // Small delay to prevent API flooding (Cloudflare AI / Local Analysis)
                    await new Promise((resolve) => setTimeout(resolve, 500));
                } catch (err) {
                    console.error("Failed to import bookmark:", url, err);
                }
            }

            importStatus = "Merging duplicate folders...";
            await mergeDuplicateFolders();

            importStatus = `Successfully imported ${importedCount} bookmarks.`;
            isComplete = true;
            await incrementUsage();
        } catch (error) {
            console.error("Import error:", error);
            importStatus =
                "Error importing bookmarks. " + (error as Error).message;
        } finally {
            isLoading = false;
        }
    }

    function isValidUrl(url: string) {
        return (
            url && !url.startsWith("javascript:") && !url.startsWith("place:")
        );
    }
</script>

<Card class="w-full">
    <CardHeader class="pb-3">
        <CardTitle class="text-lg font-semibold flex items-center gap-2">
            <FileUp class="h-5 w-5" />
            Import Chrome Bookmarks
        </CardTitle>
    </CardHeader>
    <CardContent>
        {#if limitReached && !isLoading && !isComplete}
            <div
                class="flex flex-col items-center justify-center py-6 text-center space-y-3"
            >
                <div class="rounded-full bg-red-100 p-3 dark:bg-red-900/20">
                    <AlertCircle
                        class="h-8 w-8 text-red-600 dark:text-red-500"
                    />
                </div>
                <h3 class="text-lg font-semibold">Monthly Limit Reached</h3>
                <p class="text-sm text-muted-foreground max-w-xs">
                    You have reached the free limit of {MONTHLY_LIMIT} bulk imports
                    for this month.
                </p>
                <div class="pt-2">
                    <Button
                        variant="outline"
                        href="https://github.com/sponsors/rinturaj"
                        target="_blank"
                        class="gap-2"
                    >
                        <span class="text-red-500">♥</span> Become a Sponsor
                    </Button>
                </div>
            </div>
        {:else if !isLoading && !isComplete}
            <!-- Drag and Drop View -->
            <div
                class="flex flex-col items-center justify-center w-full p-6 border-2 border-dashed rounded-lg transition-colors duration-200 cursor-pointer
                {isDragging
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:bg-secondary/50'}"
                on:dragover={handleDragOver}
                on:dragleave={handleDragLeave}
                on:drop={handleDrop}
                on:click={() => fileInput.click()}
                tabindex="0"
                role="button"
            >
                <input
                    bind:this={fileInput}
                    type="file"
                    accept=".html"
                    class="hidden"
                    on:change={handleFileSelect}
                />

                {#if selectedFile}
                    <div class="flex flex-col items-center text-center">
                        <div class="h-10 w-10 text-primary mb-2">
                            <FileUp class="h-full w-full" />
                        </div>
                        <p class="text-sm font-medium">{selectedFile.name}</p>
                        <p class="text-xs text-muted-foreground">
                            {(selectedFile.size / 1024).toFixed(1)} KB
                        </p>
                    </div>
                {:else}
                    <div
                        class="flex flex-col items-center text-center text-muted-foreground p-4"
                    >
                        <Upload class="h-8 w-8 mb-2 opacity-50" />
                        <p class="text-sm font-medium">
                            Drag & drop your bookmarks HTML file here
                        </p>
                        <p class="text-xs mt-1">or click to select file</p>
                        <p
                            class="text-[10px] text-muted-foreground mt-2 opacity-70"
                        >
                            You have {Math.max(0, MONTHLY_LIMIT - usageCount)} imports
                            left this month.
                        </p>
                    </div>
                {/if}
            </div>

            {#if importStatus}
                <div class="mt-4 text-sm text-center text-muted-foreground">
                    {importStatus}
                </div>
            {/if}

            <div class="mt-4 flex justify-end">
                <Button disabled={!selectedFile} onclick={processImport}>
                    Proceed to Import
                </Button>
            </div>
        {/if}

        {#if isLoading}
            <!-- Progress View -->
            <div
                class="flex flex-col items-center justify-center py-6 w-full space-y-4"
                in:fade
            >
                <div class="text-4xl font-bold text-primary tabular-nums">
                    {importedCount} / {totalBookmarks}
                </div>
                <div class="w-full max-w-sm">
                    <Progress value={progressValue} class="w-full h-2" />
                </div>
                <p
                    class="text-sm text-muted-foreground text-center max-w-xs truncate animate-pulse"
                >
                    {importStatus}
                </p>
            </div>
        {/if}

        {#if isComplete}
            <!-- Success View -->
            <div
                class="flex flex-col items-center justify-center py-6 space-y-4"
                in:scale
            >
                <div class="rounded-full bg-green-100 p-3 dark:bg-green-900/20">
                    <CheckCircle
                        class="h-10 w-10 text-green-600 dark:text-green-500"
                    />
                </div>
                <div class="text-center">
                    <h3 class="text-xl font-semibold">Import Complete!</h3>
                    <p class="text-muted-foreground mt-1">
                        Successfully imported {importedCount} bookmarks.
                    </p>
                    <p
                        class="text-xs text-muted-foreground mt-2 max-w-xs mx-auto"
                    >
                        Your bookmarks are being analyzed and organized by AI in
                        the background.
                    </p>
                    <p class="text-[10px] text-muted-foreground mt-4">
                        {Math.max(0, MONTHLY_LIMIT - usageCount)} imports remaining.
                    </p>
                </div>
                <Button
                    onclick={resetImport}
                    variant="outline"
                    class="min-w-[120px]"
                >
                    Done
                </Button>
            </div>
        {/if}
    </CardContent>
</Card>
