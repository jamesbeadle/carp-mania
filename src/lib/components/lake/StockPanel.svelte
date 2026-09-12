<script lang="ts">
	import type { FarmBandStock } from '$lib/contracts/FishFarmStock';
	import type { Carp, Lake } from '$lib/domain/types';
	import DealerPanel from '../market/DealerPanel.svelte';
	import FishFarmPanel from '../market/FishFarmPanel.svelte';
	import StockTable from '../StockTable.svelte';

	let { carp, lake, farmStock }: { carp: Carp[]; lake: Lake; farmStock: FarmBandStock[] } = $props();

	const cataloguedCarp = $derived(carp.filter((fish) => fish.is_catalogued));
</script>

<section class="panel">
	<h3 class="mb-1 text-xl text-volt-300">The stock</h3>
	<p class="mb-4 text-sm text-mist-400">{cataloguedCarp.length} identified carp. Small and medium fish come from the farm; a thirty has to be grown here or bought from another water.</p>
	<StockTable carp={cataloguedCarp} />
</section>

<div class="mt-6 grid gap-6 lg:grid-cols-2">
	<FishFarmPanel {farmStock} carp={cataloguedCarp} waterAcres={Number(lake.acres)} />
	<DealerPanel carp={cataloguedCarp} />
</div>
