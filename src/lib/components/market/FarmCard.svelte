<script lang="ts">
	import type { FarmOnShelf } from '$lib/contracts/FarmShelves';
	import { GradeCatalogue } from '$lib/domain/market/farms';
	import type { TransportQuote } from '$lib/domain/market/transport';
	import { RegionCatalogue } from '$lib/domain/world/regions';
	import { formatMoney } from '$lib/format/money';
	import StatRow from '../stats/StatRow.svelte';
	import PackRow from './PackRow.svelte';

	let { shelf, money }: { shelf: FarmOnShelf; money: number } = $props();

	const NoQuarantine = 'none';
	const grade = $derived(GradeCatalogue[shelf.farm.grade]);
	const region = $derived(RegionCatalogue[shelf.farm.region]);
	const quote = $derived(shelf.quote);
	const quoteStats = $derived(quote ? statsOf(quote) : []);

	function statsOf(transport: TransportQuote) {
		return [
			{ label: 'Distance', value: `${Math.round(transport.distanceKilometres)} km`, caption: 'from your water' },
			{ label: 'Transport', value: formatMoney(transport.cost), caption: 'a load' },
			{ label: 'On the lorry', value: String(transport.transitDays), caption: transport.transitDays === 1 ? 'day' : 'days' },
			quarantineStat(transport)
		];
	}

	function quarantineStat(transport: TransportQuote) {
		const hasQuarantine = transport.quarantineDays > 0;
		if (!hasQuarantine) return { label: 'Quarantine', value: NoQuarantine };
		return { label: 'Quarantine', value: `${transport.quarantineDays} days`, caption: `up to ${transport.conditionLoss} condition lost`, tone: 'warning' as const };
	}
</script>

<section class="panel">
	<div class="mb-1 flex flex-wrap items-baseline justify-between gap-2">
		<h3 class="text-xl text-volt-300">{shelf.farm.name}</h3>
		<span class="rounded-full bg-carbon-800 px-3 py-0.5 text-xs text-mist-200">{grade.label} · {region.label}</span>
	</div>
	<p class="text-sm text-mist-300">{shelf.farm.story} {grade.words}.</p>
	{#if quote}
		<div class="my-4"><StatRow stats={quoteStats} /></div>
	{:else}
		<p class="mt-1 mb-3 text-xs text-mist-400">Transport is quoted once you have a water to deliver to.</p>
	{/if}
	{#if shelf.packs.length === 0}
		<p class="text-sm text-mist-400">Nothing on the list this week. Come back next fishery week.</p>
	{:else}
		<ul class="divide-y divide-carbon-700/60">
			{#each shelf.packs as pack (pack.id)}
				<PackRow farm={shelf.farm} {pack} transportCost={quote?.cost ?? 0} {money} />
			{/each}
		</ul>
	{/if}
</section>
