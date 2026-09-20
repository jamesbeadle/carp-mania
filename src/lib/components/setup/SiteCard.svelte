<script lang="ts">
	import { SiteCatalogue } from '$lib/domain/sites/siteCatalogue';
	import { siteStartsWith } from '$lib/domain/sites/siteGuide';
	import { priceOfSite } from '$lib/domain/sites/siteTemplates';
	import type { SiteType } from '$lib/domain/types';
	import type { RegionCode } from '$lib/domain/world/regionCodes';
	import { formatMoney } from '$lib/format/money';

	let { site, region, plotAcres, isChosen, onChoose }: { site: SiteType; region: RegionCode; plotAcres: number; isChosen: boolean; onChoose: (site: SiteType) => void } = $props();

	const profile = $derived(SiteCatalogue[site]);
	const startsWith = $derived(siteStartsWith(site));
	const price = $derived(priceOfSite(site, region, plotAcres));
	const acres = $derived(profile.fixedPlotAcres ?? plotAcres);
</script>

<label class="block cursor-pointer rounded-xl border p-4 transition {isChosen ? 'border-volt-500 bg-volt-500/10 shadow-volt' : 'border-carbon-700 bg-carbon-900/60 hover:border-carbon-600'}">
	<input type="radio" name="site" value={site} checked={isChosen} onchange={() => onChoose(site)} class="sr-only" />
	<div class="flex items-baseline justify-between gap-3">
		<h3 class="text-xl" class:text-volt-300={isChosen} class:text-mist-100={!isChosen}>{profile.label}</h3>
		<span class="font-display text-xl font-bold text-volt-300 italic">{formatMoney(price)}</span>
	</div>
	<p class="mt-1 text-sm text-mist-200">{profile.blurb}</p>
	<dl class="mt-3 space-y-2 text-xs">
		<div><dt class="stat-label text-xs">Starts with</dt><dd class="text-mist-300">{acres} acres of land · {startsWith.join(' · ')}</dd></div>
		<div><dt class="stat-label text-xs text-danger-400">The problem</dt><dd class="text-danger-400">{profile.problem}</dd></div>
	</dl>
</label>
