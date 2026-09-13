<script lang="ts">
	const hints = [
		{ key: 'Click peg', action: 'choose swim' },
		{ key: 'Click water', action: 'cast next rod' },
		{ key: '1 2 3', action: 'reel a rod in' },
		{ key: 'Enter', action: 'strike' },
		{ key: 'Hold Space', action: 'reel' },
		{ key: 'Release', action: 'give line on a run' }
	];
</script>

<div class="pointer-events-none absolute right-3 bottom-2 hidden flex-wrap items-center justify-end gap-x-5 gap-y-2 text-sm lg:flex">
	{#each hints as hint (hint.key)}
		<span><kbd class="rounded border border-carbon-600 bg-carbon-950/70 px-2 py-0.5 font-display text-xs font-bold tracking-wide text-volt-300 uppercase backdrop-blur">{hint.key}</kbd> <span class="text-mist-100/90 drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)]">{hint.action}</span></span>
	{/each}
</div>
