<script lang="ts">
	import StockTable from '$lib/components/StockTable.svelte';
	import FishFarmPanel from '$lib/components/market/FishFarmPanel.svelte';
	import type { FarmBandStock } from '$lib/contracts/FishFarmStock';
	import { WizardStep } from '$lib/contracts/SetupProgress';
	import type { MyFishery } from '$lib/server/queries/GetMyFishery';

	let { fishery, farmStock }: { fishery: MyFishery; farmStock: FarmBandStock[] } = $props();

	const catalogued = $derived(fishery.carp.filter((fish) => fish.is_catalogued));
	const unknownCount = $derived(fishery.carp.length - catalogued.length);
</script>

<div class="grid gap-6 lg:grid-cols-2">
	<FishFarmPanel {farmStock} carp={catalogued} waterAcres={Number(fishery.lake.acres)} />
	<section class="panel">
		<h3 class="mb-1 text-xl text-volt-300">What lives here already</h3>
		<p class="mb-4 text-sm text-mist-400">
			{catalogued.length} known carp{unknownCount > 0 ? `, and word of ${unknownCount} more nobody has catalogued` : ''}. A thirty has to be grown here or bought on the market; the farm sells nothing over 25 lb.
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
