<script lang="ts">
	import { isBandOf, type SizeBandName } from '$lib/domain/stock/stockBySize';
	import type { Carp, Lake } from '$lib/domain/types';
	import StockActions from './StockActions.svelte';
	import StockBySize from './StockBySize.svelte';
	import StockList from './StockList.svelte';

	interface Props {
		carp: Carp[];
		lake: Lake;
		waters: Lake[];
	}

	let { carp, lake, waters }: Props = $props();

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
	<div class="mb-3 flex flex-wrap items-start justify-between gap-3">
		<div>
			<h3 class="mb-1 text-xl text-volt-300">The stock</h3>
			<p class="text-sm text-mist-400">{cataloguedCarp.length} identified carp. Small fish come from a stock farm; a forty from a specialist; a fifty from a record grower, dear and old.</p>
		</div>
		<a href="/market/farms" class="button-primary text-base">Buy from the farms</a>
	</div>
	<StockBySize carp={cataloguedCarp} {chosenBand} onChoose={(band) => (chosenBand = band)} />
	<StockList carp={shown} {chosenIds} onChosen={(ids) => (chosenIds = ids)} />
	<StockActions {chosen} {lake} {waters} />
</section>
