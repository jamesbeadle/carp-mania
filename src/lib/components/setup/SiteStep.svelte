<script lang="ts">
	import type { RegionGuide as RegionGuideFacts } from '$lib/contracts/RegionGuide';
	import { WizardStep } from '$lib/contracts/SetupProgress';
	import { OfferedSites } from '$lib/domain/sites/siteCatalogue';
	import { priceOfSite } from '$lib/domain/sites/siteTemplates';
	import type { SiteType } from '$lib/domain/types';
	import { formatMoney } from '$lib/format/money';
	import PlotSizePicker from './PlotSizePicker.svelte';
	import RegionGuide from './RegionGuide.svelte';
	import SiteCard from './SiteCard.svelte';

	let { guide, moneyLeft }: { guide: RegionGuideFacts; moneyLeft: number } = $props();

	const DefaultSite: SiteType = 'gravel_pit';
	const DefaultPlotAcres = 10;

	let chosenSite = $state<SiteType>(DefaultSite);
	let plotAcres = $state(DefaultPlotAcres);
	const price = $derived(priceOfSite(chosenSite, guide.region, plotAcres));
	const canAfford = $derived(price <= moneyLeft);
</script>

<div class="grid gap-6 lg:grid-cols-[2fr_3fr]">
	<RegionGuide {guide} />
	<form method="POST" action="?/buySite" class="panel">
		<h2 class="mb-1 text-2xl text-volt-300">Choose your site</h2>
		<p class="mb-4 text-sm text-mist-400">The works already done, plus land at {formatMoney(guide.landPricePerAcre)} an acre in {guide.label}.</p>
		<div class="grid gap-3 md:grid-cols-2">
			{#each OfferedSites as site (site)}
				<SiteCard {site} region={guide.region} {plotAcres} isChosen={site === chosenSite} onChoose={(picked) => (chosenSite = picked)} />
			{/each}
		</div>
		<div class="mt-5 border-t border-carbon-700 pt-4">
			<PlotSizePicker site={chosenSite} region={guide.region} bind:plotAcres />
		</div>
		{#if !canAfford}
			<p class="mt-3 text-sm text-danger-400">That is more than the {formatMoney(moneyLeft)} you have. Try a smaller plot or a cheaper site.</p>
		{/if}
		<footer class="mt-5 flex items-center gap-3">
			<a href="?step={WizardStep.ChoosePlot}" class="button-secondary">← Back</a>
			<button class="button-primary ml-auto" disabled={!canAfford}>Buy this site → {formatMoney(price)}</button>
		</footer>
	</form>
</div>
