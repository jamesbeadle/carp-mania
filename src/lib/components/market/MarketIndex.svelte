<script lang="ts">
	import { isWeightBandKey, WeightBandCatalogue } from '$lib/domain/market/marketFilters';
	import { MarketIndexWindowFisheryDays, type IndexBand } from '$lib/domain/market/marketIndex';
	import { MarketParameters } from '$lib/domain/market/readMarketFilters';
	import { formatMoney } from '$lib/format/money';

	let { bands }: { bands: IndexBand[] } = $props();

	const bandWord = (label: string) => (isWeightBandKey(label) ? WeightBandCatalogue[label].label : label);
	const salesWord = (sales: number) => `${sales} ${sales === 1 ? 'sale' : 'sales'}`;
</script>

<p class="my-4 flex flex-wrap items-baseline gap-x-3 gap-y-1 text-sm text-mist-200">
	<span class="stat-label">Market index · {MarketIndexWindowFisheryDays} fishery days</span>
	{#if bands.length === 0}
		<span class="text-mist-400">No sales yet — the guide price is the only guide.</span>
	{/if}
	{#each bands as band (band.label)}
		{#if isWeightBandKey(band.label)}
			<a href="/market?{MarketParameters.Band}={band.label}" class="hover:underline">
				<span class="text-volt-300">{bandWord(band.label)}</span> {formatMoney(band.poundsPerLb)}/lb <span class="text-mist-400">({salesWord(band.sales)})</span>
			</a>
		{:else}
			<span><span class="text-volt-300">{bandWord(band.label)}</span> {formatMoney(band.poundsPerLb)}/lb <span class="text-mist-400">({salesWord(band.sales)})</span></span>
		{/if}
	{/each}
</p>
