<script lang="ts">
	import { MarketKindFilters, MarketKindLabels, MarketSortKeys, MarketSorts, MaximumPriceChoices, WeightBandCatalogue, WeightBandKeys, type MarketFilters } from '$lib/domain/market/marketFilters';
	import { MarketParameters } from '$lib/domain/market/readMarketFilters';
	import { StrainCatalogue, Strains } from '$lib/domain/strains';
	import { RegionCodes } from '$lib/domain/world/regionCodes';
	import { RegionCatalogue } from '$lib/domain/world/regions';
	import { formatMoney } from '$lib/format/money';
	import FacetSelect from './FacetSelect.svelte';

	let { filters }: { filters: MarketFilters } = $props();

	let form: HTMLFormElement;
	const apply = () => form.requestSubmit();

	const bandOptions = WeightBandKeys.map((key) => ({ value: key, label: WeightBandCatalogue[key].label }));
	const strainOptions = Strains.map((strain) => ({ value: strain, label: StrainCatalogue[strain].label }));
	const priceOptions = MaximumPriceChoices.map((price) => ({ value: String(price), label: `Up to ${formatMoney(price)}` }));
	const regionOptions = RegionCodes.map((region) => ({ value: region, label: RegionCatalogue[region].label }));
	const sortOptions = MarketSortKeys.map((sort) => ({ value: sort, label: MarketSorts[sort] }));
	const hasFilters = $derived(filters.band !== null || filters.strain !== null || filters.maxPrice !== null || filters.region !== null || filters.lake !== null);
</script>

<form bind:this={form} method="GET" action="/market" class="panel flex flex-wrap items-end gap-3">
	{#if filters.lake}<input type="hidden" name={MarketParameters.Lake} value={filters.lake} />{/if}
	<FacetSelect name={MarketParameters.Band} label="Weight" value={filters.band ?? ''} options={bandOptions} onchange={apply} />
	<FacetSelect name={MarketParameters.Strain} label="Strain" value={filters.strain ?? ''} options={strainOptions} onchange={apply} />
	<FacetSelect name={MarketParameters.MaxPrice} label="Price" value={filters.maxPrice === null ? '' : String(filters.maxPrice)} options={priceOptions} anyLabel="Any price" onchange={apply} />
	<FacetSelect name={MarketParameters.Region} label="Region" value={filters.region ?? ''} options={regionOptions} anyLabel="Anywhere" onchange={apply} />
	<fieldset class="flex gap-1 rounded-md border border-carbon-600 p-1">
		{#each MarketKindFilters as kind (kind)}
			<label class="cursor-pointer rounded px-3 py-1 text-sm transition" class:bg-volt-500={filters.kind === kind} class:text-carbon-950={filters.kind === kind} class:text-mist-200={filters.kind !== kind}>
				<input type="radio" name={MarketParameters.Kind} value={kind} checked={filters.kind === kind} onchange={apply} class="sr-only" />
				{MarketKindLabels[kind]}
			</label>
		{/each}
	</fieldset>
	<FacetSelect name={MarketParameters.Sort} label="Sort" value={filters.sort} options={sortOptions} anyLabel={null} onchange={apply} />
	<button class="button-secondary px-3 py-1.5 text-base">Apply</button>
	{#if hasFilters}<a href="/market" class="text-sm text-mist-400 hover:text-mist-100">Clear</a>{/if}
</form>
