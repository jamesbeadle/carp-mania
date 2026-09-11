<script lang="ts">
	import CatchReportList from '$lib/components/CatchReportList.svelte';
	import LakeCanvas from '$lib/components/LakeCanvas.svelte';
	import StockTable from '$lib/components/StockTable.svelte';
	import WaterQualityBars from '$lib/components/WaterQualityBars.svelte';
	import { formatMoney } from '$lib/format/money';

	let { data } = $props();

	const carpNames = $derived(Object.fromEntries(data.water.carp.map((fish) => [fish.id, fish.name])));
</script>

<div class="mb-6 flex flex-wrap items-end gap-4">
	<div>
		<p class="stat-label">{data.water.ownerName}'s water</p>
		<h1 class="text-4xl text-volt-300">{data.water.lake.name}</h1>
	</div>
	<a href="/fish/{data.water.lake.id}" class="button-primary ml-auto">Fish here for {formatMoney(data.water.lake.day_ticket_fee)}</a>
</div>

<div class="grid gap-6 lg:grid-cols-[3fr_2fr]">
	<LakeCanvas lake={data.water.lake} swims={data.water.swims} carp={data.water.carp} />
	<section class="panel">
		<h2 class="mb-3 text-xl text-volt-300">The water</h2>
		<WaterQualityBars lake={data.water.lake} />
	</section>
</div>

<div class="mt-6 grid gap-6 lg:grid-cols-2">
	<section class="panel">
		<h2 class="mb-3 text-xl text-volt-300">The stock</h2>
		<StockTable carp={data.water.carp} limit={15} />
	</section>
	<section class="panel">
		<h2 class="mb-3 text-xl text-volt-300">Recent catches</h2>
		<CatchReportList catches={data.water.catches} {carpNames} />
	</section>
</div>
