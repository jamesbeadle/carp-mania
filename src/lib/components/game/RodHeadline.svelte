<script lang="ts">
	import type { TackleMatch } from '$lib/domain/fishing/tackleMatch';
	import { castDistanceFeet } from '$lib/domain/tackle/castDistance';
	import { landsUpToLb } from '$lib/domain/tackle/rods';
	import type { RodKit } from '$lib/domain/tackle/rodSetup';
	import MatchDial from './MatchDial.svelte';
	import MatchReadout from './MatchReadout.svelte';

	let { kit, match, isShowingHints, hintsUnlockAt }: { kit: RodKit; match: TackleMatch; isShowingHints: boolean; hintsUnlockAt: number } = $props();

	const headlines = $derived([
		{ label: 'Lands up to', value: String(landsUpToLb(kit.rod.rod)), unit: 'lb' },
		{ label: 'Casts', value: String(castDistanceFeet(kit)), unit: 'ft' }
	]);
</script>

<div class="flex items-center gap-4 rounded-xl border border-carbon-700/60 bg-carbon-950/60 p-3">
	<MatchDial share={match.overall} isUnlocked={isShowingHints} unlocksAt={hintsUnlockAt} />
	<div class="flex min-w-0 flex-1 flex-col gap-2">
		<dl class="flex flex-wrap gap-x-5 gap-y-1">
			{#each headlines as headline (headline.label)}
				<div><dt class="stat-label">{headline.label}</dt><dd><span class="font-display text-3xl leading-none font-extrabold text-volt-300 italic tabular-nums">{headline.value}</span> <span class="text-xs text-mist-400">{headline.unit}</span></dd></div>
			{/each}
		</dl>
		{#if isShowingHints}<MatchReadout {match} />{/if}
	</div>
</div>
