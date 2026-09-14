<script lang="ts">
	let { lakeName }: { lakeName: string } = $props();
</script>

<a href="/lake/pin" class="short:py-1 flex items-center justify-between gap-3 rounded-lg border border-volt-500/40 bg-volt-500/10 px-3 py-1.5 text-xs text-mist-100 transition hover:bg-volt-500/15 sm:text-sm">
	<span class="min-w-0 truncate">{lakeName} is not on the map yet.</span>
	<span class="shrink-0 font-display font-bold tracking-wide text-volt-300 uppercase">Put it on the map →</span>
</a>
