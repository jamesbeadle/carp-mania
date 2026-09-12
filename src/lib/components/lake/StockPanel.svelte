<script lang="ts">
	import type { FarmBandStock } from '$lib/contracts/FishFarmStock';
	import type { Carp, Lake } from '$lib/domain/types';
	import Skeleton from '../loading/Skeleton.svelte';
	import DealerPanel from '../market/DealerPanel.svelte';
	import FishFarmPanel from '../market/FishFarmPanel.svelte';
	import StockTable from '../StockTable.svelte';

	interface Props {
		carp: Carp[];
		lake: Lake;
		farmStock: Promise<FarmBandStock[]>;
	}

	let { carp, lake, farmStock }: Props = $props();

	const cataloguedCarp = $derived(carp.filter((fish) => fish.is_catalogued));
</script>

<section class="panel">
	<h3 class="mb-1 text-xl text-volt-300">The stock</h3>
	<p class="mb-4 text-sm text-mist-400">{cataloguedCarp.length} identified carp. Small and medium fish come from the farm; a thirty has to be grown here or bought from another water.</p>
	<StockTable carp={cataloguedCarp} />
</section>

<div class="mt-6 grid gap-6 lg:grid-cols-2">
	{#await farmStock}
		<Skeleton title="The fish farm" rows={5} />
	{:then bands}
		<FishFarmPanel farmStock={bands} carp={cataloguedCarp} waterAcres={Number(lake.acres)} />
	{:catch}
		<section class="panel"><p class="text-sm text-mist-400">The fish farm is not answering the phone. Try again in a moment.</p></section>
	{/await}
	<DealerPanel carp={cataloguedCarp} />
</div>
