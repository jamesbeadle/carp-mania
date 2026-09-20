<script lang="ts">
	import { headCountIn } from '$lib/domain/stock/headCount';
	import type { Shoal } from '$lib/domain/stock/shoals';
	import type { Carp, Lake } from '$lib/domain/types';
	import { CeilingWords, lakeCeilingOf, weakestCeilingFactor } from '$lib/domain/water/lakeCeiling';
	import type { LakeSpecies } from '$lib/domain/water/species';
	import StatTile from '../stats/StatTile.svelte';

	let { lake, carp, shoals, species }: { lake: Lake; carp: Carp[]; shoals: Shoal[]; species: LakeSpecies[] } = $props();

	const reading = $derived(lakeCeilingOf(lake, headCountIn(carp, shoals), species));
	const holdingItDown = $derived(CeilingWords[weakestCeilingFactor(reading)]);
</script>

<StatTile label="Grows fish to" value="{reading.ceilingLb} lb" caption="of {reading.regionCeilingLb} lb possible here" share={reading.ceilingLb / reading.regionCeilingLb} verdict="Held down by {holdingItDown}">
	{#snippet why()}
		The region sets the most a carp can ever reach here. Stocking density, cover for the fish to feed with confidence, the state of the water and the other species eating the feed each take a share off it; the weakest of the four is what to fix first.
	{/snippet}
</StatTile>
