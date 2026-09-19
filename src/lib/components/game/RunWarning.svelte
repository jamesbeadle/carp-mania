<script lang="ts">
	let { isRunning, isRunComing }: { isRunning: boolean; isRunComing: boolean } = $props();

	const Words = { Running: "It's running — let go and let it take line", Coming: "It's going — get ready to let go", Tiring: "It's tiring — hold to reel" } as const;
	const words = $derived(wordsFor(isRunning, isRunComing));

	function wordsFor(running: boolean, coming: boolean) {
		if (running) return Words.Running;
		if (coming) return Words.Coming;
		return Words.Tiring;
	}
</script>

<p
	class="rounded-md px-3 py-2 text-center font-display text-lg font-bold tracking-wide uppercase transition-colors"
	class:bg-danger-500={isRunning}
	class:text-mist-100={isRunning}
	class:bg-warning-500={isRunComing}
	class:text-carbon-950={isRunComing}
	class:bg-carbon-900={!isRunning && !isRunComing}
	class:text-volt-300={!isRunning && !isRunComing}
>
	{words}
</p>
