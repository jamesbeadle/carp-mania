<script lang="ts">
	import { ratingShareOf, sizeReachOf, sizeReachWords, waterShareOf } from '$lib/domain/fishing/sizeReach';
	import { matchTackleToWater } from '$lib/domain/fishing/tackleMatch';
	import type { Terrain } from '$lib/domain/layout/terrainAt';
	import { kitOf, type RodSetup } from '$lib/domain/tackle/rodSetup';
	import type { Lake } from '$lib/domain/types';
	import StatTile from '../stats/StatTile.svelte';

	interface Props {
		lake: Lake;
		rating: number;
		carpCount: number;
		terrain: Terrain;
		setup: RodSetup;
		conditionsShare: number;
	}

	let { lake, rating, carpCount, terrain, setup, conditionsShare }: Props = $props();

	const SentenceDash = ' — ';
	const kit = $derived(kitOf(setup));
	const tackleShare = $derived(kit ? matchTackleToWater(kit, lake, terrain).overall : 0);
	const shares = $derived({ ratingShare: ratingShareOf(rating), tackleShare, conditionsShare, waterShare: waterShareOf(lake, carpCount) });
	const reach = $derived(sizeReachOf(shares));
	const verdict = $derived(verdictOf(sizeReachWords(reach, shares)));

	function verdictOf(sentence: string) {
		const [, afterTheDash] = sentence.split(SentenceDash);
		return afterTheDash.charAt(0).toUpperCase() + afterTheDash.slice(1);
	}
</script>

<StatTile label="Size reach" value={String(Math.round(reach * 100))} caption="of 100" share={reach} {verdict}>
	{#snippet why()}
		Your rating, your tackle, the hour and the weather, and the water each take a share of the reach. The weakest of the four is what to fix first; the readout follows the rod you are setting up.
	{/snippet}
</StatTile>
