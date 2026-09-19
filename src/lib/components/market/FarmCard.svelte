<script lang="ts">
	import type { FarmOnShelf } from '$lib/contracts/FarmShelves';
	import { GradeCatalogue } from '$lib/domain/market/farms';
	import { RegionCatalogue } from '$lib/domain/world/regions';
	import { formatMoney } from '$lib/format/money';
	import PackRow from './PackRow.svelte';

	let { shelf, money }: { shelf: FarmOnShelf; money: number } = $props();

	const grade = $derived(GradeCatalogue[shelf.farm.grade]);
	const region = $derived(RegionCatalogue[shelf.farm.region]);
	const quote = $derived(shelf.quote);
	const quarantineWords = $derived(quote && quote.quarantineDays > 0 ? `, then ${quote.quarantineDays} days' quarantine and up to ${quote.conditionLoss} condition lost on the road` : '');
	const dayWord = $derived(quote?.transitDays === 1 ? 'day' : 'days');
	const kilometres = $derived(Math.round(quote?.distanceKilometres ?? 0));
</script>

<section class="panel">
	<div class="mb-1 flex flex-wrap items-baseline justify-between gap-2">
		<h3 class="text-xl text-volt-300">{shelf.farm.name}</h3>
		<span class="rounded-full bg-carbon-800 px-3 py-0.5 text-xs text-mist-200">{grade.label} · {region.label}</span>
	</div>
	<p class="text-sm text-mist-300">{shelf.farm.story} {grade.words}.</p>
	{#if quote}
		<p class="mt-1 mb-3 text-xs text-mist-400">
			{kilometres} km from your water: transport {formatMoney(quote.cost)}, {quote.transitDays} {dayWord} on the lorry{quarantineWords}.
		</p>
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
