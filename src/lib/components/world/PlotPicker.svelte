<script lang="ts">
	import type { ChosenPlot } from '$lib/domain/sites/chosenPlot';
	import { RegionCodes, type RegionCode } from '$lib/domain/world/regionCodes';
	import { whyPlotIsRefused } from '$lib/domain/world/plotRules';
	import { RegionCatalogue } from '$lib/domain/world/regions';
	import { formatMoney } from '$lib/format/money';
	import Globe from './Globe.svelte';

	interface Props {
		region: RegionCode | null;
		latitude: number | null;
		longitude: number | null;
		onPick: (pick: ChosenPlot) => void;
	}

	let { region, latitude, longitude, onPick }: Props = $props();

	const PickARegionFirst = 'Pick a region first, then click your plot on the globe.';
	const ClickYourPlot = 'Click the land where your water will be.';
	const CoordinateDecimals = 2;

	let chosenRegion = $derived(region);
	let refusal = $state<string | null>(null);
	const plot = $derived(latitude !== null && longitude !== null ? { latitude, longitude } : null);

	function chooseRegion(code: RegionCode) {
		chosenRegion = code;
		refusal = null;
	}

	function handleGlobeClick(clickedLatitude: number, clickedLongitude: number) {
		refusal = chosenRegion ? whyPlotIsRefused(chosenRegion, clickedLatitude, clickedLongitude) : PickARegionFirst;
		if (refusal || !chosenRegion) return;
		onPick({ region: chosenRegion, latitude: clickedLatitude, longitude: clickedLongitude });
	}

	function describePlot() {
		if (!chosenRegion) return PickARegionFirst;
		if (!plot) return ClickYourPlot;
		const northing = `${Math.abs(plot.latitude).toFixed(CoordinateDecimals)}° ${plot.latitude >= 0 ? 'N' : 'S'}`;
		const easting = `${Math.abs(plot.longitude).toFixed(CoordinateDecimals)}° ${plot.longitude >= 0 ? 'E' : 'W'}`;
		return `Pinned at ${northing}, ${easting} in ${RegionCatalogue[chosenRegion].label}.`;
	}
</script>

<div class="grid gap-4 md:grid-cols-[16rem_1fr]">
	<ul class="flex gap-2 overflow-x-auto pb-1 md:flex-col md:overflow-visible md:pb-0">
		{#each RegionCodes as code (code)}
			{@const profile = RegionCatalogue[code]}
			{@const isChosen = code === chosenRegion}
			<li class="shrink-0 md:shrink">
				<button type="button" class="w-full rounded-md border px-3 py-2 text-left whitespace-nowrap transition md:whitespace-normal {isChosen ? 'border-volt-500 bg-volt-500/10' : 'border-carbon-700 hover:border-carbon-600'}" onclick={() => chooseRegion(code)}>
					<span class="block font-display text-lg font-bold uppercase italic {isChosen ? 'text-volt-300' : 'text-mist-100'}">{profile.label}</span>
					<span class="block text-xs text-mist-400">{formatMoney(profile.landPricePerAcre)} an acre · fish to {profile.growthCeilingLb} lb</span>
				</button>
			</li>
		{/each}
	</ul>
	<div class="flex flex-col gap-3">
		<Globe pins={[]} mode="choose_plot" region={chosenRegion} {plot} onGlobeClick={handleGlobeClick} />
		{#if refusal}
			<p class="rounded-xl border border-danger-500/40 bg-danger-500/10 px-4 py-2 text-sm text-danger-400">{refusal}</p>
		{:else}
			<p class="text-sm text-mist-400">{describePlot()}</p>
		{/if}
	</div>
</div>
