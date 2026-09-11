<script lang="ts">
	import ActionMessage from '$lib/components/ActionMessage.svelte';
	import PlotPicker from '$lib/components/world/PlotPicker.svelte';
	import { TheGameHasGrown } from '$lib/components/world/theGameHasGrown';
	import type { ChosenPlot } from '$lib/domain/sites/chosenPlot';
	import { RegionCatalogue } from '$lib/domain/world/regions';

	let { data, form } = $props();

	const CoordinateDecimals = 2;

	let pick = $state<ChosenPlot | null>(null);
	let isPickOutsideHomeRegion = $state(false);
	const regionLabel = $derived(RegionCatalogue[data.water.region].label);

	function handlePick(next: ChosenPlot) {
		isPickOutsideHomeRegion = next.region !== data.water.region;
		if (isPickOutsideHomeRegion) return;
		pick = next;
	}
</script>

<header class="mb-6">
	<p class="stat-label">{data.water.name}</p>
	<h1 class="text-4xl text-volt-300">Put your water on the map</h1>
</header>

<section class="panel mb-6 border-volt-500/40">
	<p class="text-mist-100">{TheGameHasGrown}</p>
</section>

<ActionMessage {form} />

<section class="panel">
	<p class="mb-4 text-sm text-mist-400">{data.water.name} is in {regionLabel}. Click the land where it sits — a pin is placed once and never moves.</p>
	<PlotPicker region={data.water.region} latitude={pick?.latitude ?? null} longitude={pick?.longitude ?? null} onPick={handlePick} />
	{#if isPickOutsideHomeRegion}
		<p class="mt-3 rounded-xl border border-danger-500/40 bg-danger-500/10 px-4 py-2 text-sm text-danger-400">Your water is in {regionLabel}.</p>
	{/if}
	<form method="POST" action="?/pin" class="mt-4 flex flex-wrap items-center gap-3">
		<input type="hidden" name="latitude" value={pick?.latitude ?? ''} />
		<input type="hidden" name="longitude" value={pick?.longitude ?? ''} />
		<p class="text-sm text-mist-200">
			{#if pick}Pin dropped at {pick.latitude.toFixed(CoordinateDecimals)}°, {pick.longitude.toFixed(CoordinateDecimals)}° in {regionLabel}{:else}No pin yet{/if}
		</p>
		<button class="button-primary ml-auto" disabled={!pick}>Pin it here</button>
	</form>
</section>
