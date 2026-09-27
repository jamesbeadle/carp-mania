<script lang="ts">
	let { isRunning, isRunComing }: { isRunning: boolean; isRunComing: boolean } = $props();

	const Words = { Running: "It's running — let go, give it line", Coming: "It's going — get ready to let go", Tiring: 'Hold to reel · let go to give line' } as const;
	const words = $derived(wordsFor(isRunning, isRunComing));

	function wordsFor(running: boolean, coming: boolean) {
		if (running) return Words.Running;
		if (coming) return Words.Coming;
		return Words.Tiring;
	}
</script>

<p class="hud-label truncate text-center transition-colors" class:text-danger-400={isRunning} class:text-warning-500={isRunComing} class:animate-pulse={isRunning}>{words}</p>
