<script lang="ts">
	import { PlotSizes, SiteCatalogue } from '$lib/domain/sites/siteCatalogue';
	import type { SiteType } from '$lib/domain/types';
	import { landPriceFor } from '$lib/domain/world/regions';
	import type { RegionCode } from '$lib/domain/world/regionCodes';
	import { formatMoney } from '$lib/format/money';

	let { site, region, plotAcres = $bindable(10) }: { site: SiteType; region: RegionCode; plotAcres: number } = $props();

	const fixedAcres = $derived(SiteCatalogue[site].fixedPlotAcres);
</script>

{#if fixedAcres !== null}
	<p class="text-sm text-mist-400">A {SiteCatalogue[site].label.toLowerCase()} comes as it is: {fixedAcres} acres, land included.</p>
{:else}
	<fieldset>
		<legend class="stat-label mb-2">Plot size</legend>
		<div class="flex flex-wrap gap-2">
			{#each PlotSizes as acres (acres)}
				<label
					class="cursor-pointer rounded-full border px-4 py-1.5 text-sm transition"
					class:border-volt-500={plotAcres === acres}
					class:text-volt-300={plotAcres === acres}
					class:border-carbon-600={plotAcres !== acres}
					class:text-mist-200={plotAcres !== acres}
				>
					<input type="radio" name="plotAcres" value={acres} bind:group={plotAcres} class="sr-only" />
					{acres} acres <span class="text-xs text-mist-400">land {formatMoney(landPriceFor(region, acres))}</span>
				</label>
			{/each}
		</div>
	</fieldset>
{/if}
