<script lang="ts">
	import CatchReportList from '$lib/components/CatchReportList.svelte';
	import LakeCanvas from '$lib/components/LakeCanvas.svelte';
	import StockTable from '$lib/components/StockTable.svelte';
	import WaterQualityBars from '$lib/components/WaterQualityBars.svelte';
	import FavouriteStar from '$lib/components/lakes/FavouriteStar.svelte';
	import { RegionCatalogue } from '$lib/domain/world/regions';
	import { formatMoney } from '$lib/format/money';
	import { worldUrlForLake } from '$lib/game/world/worldUrl';

	let { data } = $props();

	const carpNames = $derived(Object.fromEntries(data.water.carp.map((fish) => [fish.id, fish.name])));
	const isOnTheGlobe = $derived(data.water.lake.latitude !== null);
</script>

<div class="mb-6 flex flex-wrap items-end gap-4">
	<div>
		<p class="stat-label">{data.water.ownerName}'s water</p>
		<h1 class="text-4xl text-volt-300">{data.water.lake.name}</h1>
		<p class="text-sm text-mist-400">
			{RegionCatalogue[data.water.lake.region].label}
			{#if isOnTheGlobe}· <a href={worldUrlForLake(data.water.lake.id)} class="text-surge-400 hover:underline">See on the globe</a>{/if}
		</p>
	</div>
	<div class="ml-auto flex items-center gap-3">
		<FavouriteStar lakeId={data.water.lake.id} isFavourite={data.isFavourite} isLabelled />
		<a href="/fish/{data.water.lake.id}" class="button-primary">Fish here for {formatMoney(data.water.lake.day_ticket_fee)}</a>
	</div>
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
