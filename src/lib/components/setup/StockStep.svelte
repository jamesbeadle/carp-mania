<script lang="ts">
	import StockTable from '$lib/components/StockTable.svelte';
	import { WizardStep } from '$lib/contracts/SetupProgress';
	import { FarmCatalogue, GradeCatalogue } from '$lib/domain/market/farms';
	import type { MyFishery } from '$lib/server/queries/GetMyFishery';

	let { fishery }: { fishery: MyFishery } = $props();

	const catalogued = $derived(fishery.carp.filter((fish) => fish.is_catalogued));
	const unknownCount = $derived(fishery.carp.length - catalogued.length);
	const homeRegion = $derived(fishery.lake.region);
	const farmsNearby = $derived(FarmCatalogue.filter((farm) => farm.region === homeRegion));
</script>

<div class="grid gap-6 lg:grid-cols-2">
	<section class="panel">
		<h3 class="mb-1 text-xl text-volt-300">The farms</h3>
		<p class="mb-4 text-sm text-mist-400">
			Twelve farms around the world sell fish in packs — small fish by the hundred from a stock farm, a fifty from a record grower. Transport and quarantine are quoted from the farm's gate, so a farm in your own region is the cheap way to start.
		</p>
		{#if farmsNearby.length > 0}
			<ul class="mb-4 space-y-1 text-sm text-mist-200">
				{#each farmsNearby as farm (farm.id)}
					<li><span class="font-medium text-mist-100">{farm.name}</span> · {GradeCatalogue[farm.grade].label} — {farm.story}</li>
				{/each}
			</ul>
		{/if}
		<a href="/market/farms" class="button-primary">Open the farms →</a>
	</section>
	<section class="panel">
		<h3 class="mb-1 text-xl text-volt-300">What lives here already</h3>
		<p class="mb-4 text-sm text-mist-400">
			{catalogued.length} known carp{unknownCount > 0 ? `, and word of ${unknownCount} more nobody has catalogued` : ''}. A thirty has to be grown here, bought on the market, or ordered from a specialist farm.
		</p>
		{#if catalogued.length > 0}
			<StockTable carp={catalogued} />
		{:else}
			<p class="text-sm text-mist-200">Nothing yet. Every fish in this water will be one you put here.</p>
		{/if}
	</section>
</div>
<footer class="mt-6 flex items-center gap-3">
	<a href="?step={WizardStep.Survey}" class="button-secondary">← Back to the survey</a>
	<a href="?step={WizardStep.OpenTheGates}" class="button-primary ml-auto">Open the gates →</a>
</footer>
