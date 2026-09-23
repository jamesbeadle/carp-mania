<script lang="ts">
	import StockTable from '$lib/components/StockTable.svelte';
	import { WizardStep } from '$lib/contracts/SetupProgress';
	import { FarmCatalogue, GradeCatalogue } from '$lib/domain/market/farms';
	import { fishInTheWater, isStockedToOpen, OpenWater } from '$lib/domain/stock/stockedToOpen';
	import type { MyFishery } from '$lib/server/queries/GetMyFishery';
	import AboutToggle from '../stats/AboutToggle.svelte';
	import StatRow from '../stats/StatRow.svelte';

	let { fishery }: { fishery: MyFishery } = $props();

	const catalogued = $derived(fishery.carp.filter((fish) => fish.is_catalogued));
	const unknownCount = $derived(fishery.carp.length - catalogued.length);
	const homeRegion = $derived(fishery.lake.region);
	const farmsNearby = $derived(FarmCatalogue.filter((farm) => farm.region === homeRegion));
	const farmStats = $derived([
		{ label: 'Farms', value: String(FarmCatalogue.length), caption: 'worldwide' },
		{ label: 'In your region', value: String(farmsNearby.length), tone: 'volt' as const }
	]);
	const fishCount = $derived(fishInTheWater(fishery.carp, fishery.shoals));
	const isStocked = $derived(isStockedToOpen(fishCount));
	const stockStats = $derived([
		{ label: 'Known carp', value: String(catalogued.length), tone: 'volt' as const },
		{ label: 'Uncatalogued', value: String(unknownCount), caption: 'by word of mouth' },
		{ label: 'To open', value: `${fishCount} / ${OpenWater.FewestFish}`, caption: isStocked ? 'enough to open' : 'shoal fish count', tone: isStocked ? ('mist' as const) : ('danger' as const) }
	]);
</script>

<div class="grid gap-6 lg:grid-cols-2">
	<section class="panel">
		<h3 class="mb-4 text-xl text-volt-300">The farms</h3>
		<StatRow stats={farmStats} />
		{#if farmsNearby.length > 0}
			<ul class="my-4 space-y-1 text-sm text-mist-200">
				{#each farmsNearby as farm (farm.id)}
					<li class="flex flex-wrap items-baseline gap-x-2"><span class="font-medium text-mist-100">{farm.name}</span><span class="text-xs text-mist-400">{GradeCatalogue[farm.grade].label}</span></li>
				{/each}
			</ul>
		{/if}
		<a href="/market/farms" class="button-primary mt-4 inline-block">Open the farms →</a>
		<div class="mt-4">
			<AboutToggle title="About the farms">Fish come in packs — small fish by the hundred from a stock farm, a fifty from a record grower. Transport and quarantine are quoted from the farm's gate, so a farm in your own region is the cheap way to start. A water needs {OpenWater.FewestFish} fish in it before the gates open.</AboutToggle>
		</div>
	</section>
	<section class="panel">
		<h3 class="mb-4 text-xl text-volt-300">What lives here already</h3>
		<StatRow stats={stockStats} />
		<div class="mt-4">
			{#if catalogued.length > 0}
				<StockTable carp={catalogued} />
			{:else}
				<p class="text-sm text-mist-200">Nothing yet. Every fish in this water will be one you put here.</p>
			{/if}
		</div>
	</section>
</div>
<footer class="mt-6 flex items-center gap-3">
	<a href="?step={WizardStep.Survey}" class="button-secondary">← Back to the survey</a>
	<a href="?step={WizardStep.OpenTheGates}" class="button-primary ml-auto">Open the gates →</a>
</footer>
