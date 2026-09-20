<script lang="ts">
	const hints = [
		{ key: 'Click peg', action: 'choose swim' },
		{ key: 'Click water', action: 'cast next rod' },
		{ key: '1 2 3', action: 'reel a rod in' },
		{ key: 'M', action: 'move swim' },
		{ key: 'Enter', action: 'strike' },
		{ key: 'Hold Space', action: 'reel' },
		{ key: 'Release', action: 'give line on a run' }
	];
</script>

<div class="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs">
	{#each hints as hint (hint.key)}
		<span class="whitespace-nowrap"><kbd class="rounded border border-carbon-600 bg-carbon-900 px-1.5 py-0.5 font-display text-[11px] font-bold tracking-wide text-volt-300 uppercase">{hint.key}</kbd> <span class="text-mist-400">{hint.action}</span></span>
	{/each}
</div>
