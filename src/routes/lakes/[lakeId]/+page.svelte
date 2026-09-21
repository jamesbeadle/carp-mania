<script lang="ts">
	import LakeCanvas from '$lib/components/LakeCanvas.svelte';
	import FacilitiesRow from '$lib/components/facilities/FacilitiesRow.svelte';
	import StockTable from '$lib/components/StockTable.svelte';
	import WaterQualityBars from '$lib/components/WaterQualityBars.svelte';
	import DifficultyReading from '$lib/components/lake/DifficultyReading.svelte';
	import WaterShop from '$lib/components/lakes/WaterShop.svelte';
	import WaterHeadline from '$lib/components/lakes/WaterHeadline.svelte';
	import OnTheBankNow from '$lib/components/lakes/OnTheBankNow.svelte';
	import FavouriteStar from '$lib/components/lakes/FavouriteStar.svelte';
	import RecentCatchesPanel from '$lib/components/lakes/RecentCatchesPanel.svelte';
	import GoFishingButton from '$lib/components/game/GoFishingButton.svelte';
	import { RegionCatalogue } from '$lib/domain/world/regions';
	import { formatMoney } from '$lib/format/money';
	import { worldUrlForLake } from '$lib/game/world/worldUrl';

	let { data } = $props();

	const water = $derived(data.water);
	const { lake, carp, shoals, swims } = $derived(water);
	const diary = $derived(data.diary);
	const carpNames = $derived(Object.fromEntries(carp.map((fish) => [fish.id, fish.name])));
	const isOnTheGlobe = $derived(lake.latitude !== null);
	const isASyndicate = $derived(Number(lake.syndicate_price) > 0);
	const hasADiary = $derived(lake.is_booking_on || isASyndicate);
	const now = $derived(new Date(data.loadedAt));
	const isOwnWater = $derived(lake.owner_id === data.user?.id);
	const fishHereWords = $derived(isOwnWater ? 'Go fishing' : `Fish here for ${formatMoney(Number(lake.day_ticket_fee))}`);
</script>

<div class="mb-6 flex flex-wrap items-end gap-4">
	<div>
		<p class="stat-label">{water.ownerName}'s water</p>
		<h1 class="text-4xl text-volt-300">{lake.name}</h1>
		<p class="text-sm text-mist-400">
			{RegionCatalogue[lake.region].label}
			{#if isOnTheGlobe}· <a href={worldUrlForLake(lake.id)} class="text-surge-400 hover:underline">See on the globe</a>{/if}
		</p>
	</div>
	<div class="flex w-full flex-wrap items-center gap-3 sm:ml-auto sm:w-auto">
		<FavouriteStar lakeId={lake.id} isFavourite={data.isFavourite} isLabelled />
		<GoFishingButton lakeId={lake.id} words={fishHereWords} />
	</div>
</div>

<div class="grid gap-6 lg:grid-cols-[3fr_2fr]">
	<LakeCanvas {lake} {swims} {carp} {shoals} />
	<section class="panel space-y-4">
		<h2 class="text-xl text-volt-300">The water</h2>
		<WaterHeadline {lake} {carp} {shoals} book={diary.book} diary={diary.days} {now} />
		<OnTheBankNow anglers={data.onTheBank} {now} myId={data.user?.id ?? null} />
		<FacilitiesRow built={lake.layout.facilities} emptyWords="No facilities on the bank yet." />
		<DifficultyReading {lake} {carp} {shoals} />
		{#if hasADiary}<a href="/lakes/{lake.id}/book" class="button-secondary inline-block text-base">The booking diary</a>{/if}
		<WaterShop {lake} />
		<WaterQualityBars {lake} />
	</section>
</div>

<div class="mt-6 grid gap-6 lg:grid-cols-2">
	<section class="panel">
		<h2 class="mb-3 text-xl text-volt-300">The stock</h2>
		<StockTable {carp} limit={15} />
	</section>
	<RecentCatchesPanel catches={water.catches} {carpNames} />
</div>
