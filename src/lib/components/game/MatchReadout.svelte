<script lang="ts">
	import type { TackleMatch } from '$lib/domain/fishing/tackleMatch';
	import StatBar from '../stats/StatBar.svelte';

	let { match }: { match: TackleMatch } = $props();

	const parts = $derived([
		{ label: 'Line', share: match.line },
		{ label: 'Hook', share: match.hook },
		{ label: 'Rig', share: match.rig },
		{ label: 'Bait', share: match.bait },
		{ label: 'Tubing', share: match.tubing }
	]);
</script>

<dl class="grid grid-cols-5 gap-1 text-center text-[0.7rem]">
	{#each parts as part (part.label)}
		<div><dt class="text-mist-400">{part.label}</dt><dd class="tabular-nums text-mist-100">{Math.round(part.share * 100)}%</dd><StatBar share={part.share} /></div>
	{/each}
</dl>
