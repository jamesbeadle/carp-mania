<script lang="ts">
	import { goto } from '$app/navigation';
	import type { RegionGuide as RegionGuideFacts } from '$lib/contracts/RegionGuide';
	import { WizardStep } from '$lib/contracts/SetupProgress';
	import PlotPicker from '$lib/components/world/PlotPicker.svelte';
	import { chosenPlotOf, hasChosenPlot, type ChosenPlot } from '$lib/domain/sites/chosenPlot';
	import type { Profile } from '$lib/domain/types';
	import RegionGuide from './RegionGuide.svelte';

	let { profile, guide }: { profile: Profile; guide: RegionGuideFacts } = $props();

	let freshPick = $state<ChosenPlot | null>(null);
	const savedPlot = $derived(hasChosenPlot(profile) ? chosenPlotOf(profile) : null);
	const pick = $derived(freshPick ?? savedPlot);

	function handlePick(next: ChosenPlot) {
		freshPick = next;
		if (next.region !== guide.region) goto(`?step=${WizardStep.ChoosePlot}&region=${next.region}`, { noScroll: true, keepFocus: true });
	}
</script>

<div class="grid gap-6 lg:grid-cols-[3fr_2fr]">
	<section class="panel">
		<h2 class="mb-1 text-2xl text-volt-300">Where in the world?</h2>
		<p class="mb-4 text-sm text-mist-400">Click a region for its guide, then click the land inside it to drop your pin. A lake never moves, so choose your climate and your neighbours carefully.</p>
		<PlotPicker region={pick?.region ?? guide.region} latitude={pick?.latitude ?? null} longitude={pick?.longitude ?? null} onPick={handlePick} />
		<form method="POST" action="?/choosePlot" class="mt-4 flex flex-wrap items-center gap-3">
			<input type="hidden" name="region" value={pick?.region ?? ''} />
			<input type="hidden" name="latitude" value={pick?.latitude ?? ''} />
			<input type="hidden" name="longitude" value={pick?.longitude ?? ''} />
			<p class="text-sm text-mist-200">
				{#if pick}Pin dropped at {pick.latitude.toFixed(2)}°, {pick.longitude.toFixed(2)}° in {guide.label}{:else}No pin yet{/if}
			</p>
			<button class="button-primary ml-auto" disabled={!pick}>Pin it here →</button>
		</form>
	</section>
	<RegionGuide {guide} />
</div>
