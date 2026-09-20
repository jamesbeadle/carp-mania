<script lang="ts">
	import { isBandOf, type SizeBandName } from '$lib/domain/stock/stockBySize';
	import type { Shoal } from '$lib/domain/stock/shoals';
	import type { Carp, Lake } from '$lib/domain/types';
	import AboutToggle from '../stats/AboutToggle.svelte';
	import ShoalRow from './ShoalRow.svelte';
	import StockActions from './StockActions.svelte';
	import StockBySize from './StockBySize.svelte';
	import StockList from './StockList.svelte';
	import StockStats from './StockStats.svelte';

	interface Props {
		carp: Carp[];
		shoals: Shoal[];
		lake: Lake;
		waters: Lake[];
	}

	let { carp, shoals, lake, waters }: Props = $props();

	let chosenBand = $state<SizeBandName | null>(null);
	let chosenIds = $state<string[]>([]);
	const cataloguedCarp = $derived(carp.filter((fish) => fish.is_catalogued));
	const shown = $derived(shownIn(chosenBand));
	const chosen = $derived(cataloguedCarp.filter((fish) => chosenIds.includes(fish.id)));

	function shownIn(band: SizeBandName | null) {
		if (band === null) return cataloguedCarp;
		return cataloguedCarp.filter((fish) => isBandOf(fish, band));
	}
</script>

<section class="panel">
	<div class="mb-4 flex flex-wrap items-center justify-between gap-3">
		<h3 class="text-xl text-volt-300">The stock</h3>
		<a href="/market/farms" class="button-primary text-base">Buy from the farms</a>
	</div>
	<StockStats carp={cataloguedCarp} {shoals} />
	<div class="mt-5"><StockBySize carp={cataloguedCarp} {shoals} {chosenBand} onChoose={(band) => (chosenBand = band)} /></div>
	{#if shoals.length > 0}
		<ul class="mb-4 divide-y divide-carbon-700/60 border-b border-carbon-700/60">
			{#each shoals as shoal (shoal.id)}<ShoalRow {shoal} />{/each}
		</ul>
	{/if}
	<StockList carp={shown} {chosenIds} onChosen={(ids) => (chosenIds = ids)} />
	<StockActions {chosen} {lake} {waters} />
	<div class="mt-4">
		<AboutToggle title="About the stock">A shoal fish gets its name the first time it is landed. Small fish come from a stock farm; a forty from a specialist; a fifty from a record grower, dear and old.</AboutToggle>
	</div>
</section>
