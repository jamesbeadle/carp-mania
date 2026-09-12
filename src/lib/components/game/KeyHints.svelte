<script lang="ts">
	let { isAlarmMuted = $bindable(false) }: { isAlarmMuted?: boolean } = $props();

	const hints = [
		{ key: 'Click peg', action: 'choose swim' },
		{ key: 'Click water', action: 'cast next rod' },
		{ key: 'Enter', action: 'strike' },
		{ key: 'Hold Space', action: 'reel' },
		{ key: 'Release', action: 'give line on a run' }
	];
</script>

<div class="flex flex-wrap items-center gap-x-5 gap-y-2 px-1 text-sm">
	{#each hints as hint (hint.key)}
		<span><kbd class="rounded border border-carbon-600 bg-carbon-800 px-2 py-0.5 font-display text-xs font-bold tracking-wide text-volt-300 uppercase">{hint.key}</kbd> <span class="text-mist-400">{hint.action}</span></span>
	{/each}
	<label class="ml-auto flex items-center gap-2 text-xs text-mist-400"><input type="checkbox" bind:checked={isAlarmMuted} class="accent-volt-500" /> Mute alarm</label>
</div>
