<script lang="ts">
	import { isBandOf, type SizeBandName } from '$lib/domain/stock/stockBySize';
	import type { Shoal } from '$lib/domain/stock/shoals';
	import type { Carp, Lake } from '$lib/domain/types';
	import ShoalRow from './ShoalRow.svelte';
	import StockActions from './StockActions.svelte';
	import StockBySize from './StockBySize.svelte';
	import StockList from './StockList.svelte';

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
	const shoalWords = $derived(shoals.length === 0 ? '' : ` and ${shoals.length} ${shoals.length === 1 ? 'shoal' : 'shoals'}`);

	function shownIn(band: SizeBandName | null) {
		if (band === null) return cataloguedCarp;
		return cataloguedCarp.filter((fish) => isBandOf(fish, band));
	}
</script>

<section class="panel">
	<div class="mb-3 flex flex-wrap items-start justify-between gap-3">
		<div>
			<h3 class="mb-1 text-xl text-volt-300">The stock</h3>
			<p class="text-sm text-mist-400">{cataloguedCarp.length} named carp{shoalWords}. A shoal fish gets its name the first time it is landed. Small fish come from a stock farm; a forty from a specialist; a fifty from a record grower, dear and old.</p>
		</div>
		<a href="/market/farms" class="button-primary text-base">Buy from the farms</a>
	</div>
	<StockBySize carp={cataloguedCarp} {shoals} {chosenBand} onChoose={(band) => (chosenBand = band)} />
	{#if shoals.length > 0}
		<ul class="mb-4 divide-y divide-carbon-700/60 border-b border-carbon-700/60">
			{#each shoals as shoal (shoal.id)}<ShoalRow {shoal} />{/each}
		</ul>
	{/if}
	<StockList carp={shown} {chosenIds} onChosen={(ids) => (chosenIds = ids)} />
	<StockActions {chosen} {lake} {waters} />
</section>
