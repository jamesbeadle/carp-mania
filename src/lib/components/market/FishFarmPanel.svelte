<script lang="ts">
	import type { FarmBandStock } from '$lib/contracts/FishFarmStock';
	import { StockingDensity, wouldFarmRefuse } from '$lib/domain/market/density';
	import { FarmBandKeys, FarmBands, FarmDelivery, farmOrderFishCount, farmOrderHeaviestPossibleLb, farmOrderTotalCost, type FarmBandKey } from '$lib/domain/market/fishFarm';
	import type { Carp } from '$lib/domain/types';
	import { formatMoney } from '$lib/format/money';
	import FarmBandRow from './FarmBandRow.svelte';

	let { farmStock, carp, waterAcres }: { farmStock: FarmBandStock[]; carp: Carp[]; waterAcres: number } = $props();

	let order = $state(Object.fromEntries(FarmBandKeys.map((key) => [key, 0])) as Record<FarmBandKey, number>);
	const fishCount = $derived(farmOrderFishCount(order));
	const totalCost = $derived(farmOrderTotalCost(order));
	const isTooFull = $derived(wouldFarmRefuse(carp, waterAcres, farmOrderHeaviestPossibleLb(order)));
	const heaviestFarmLb = Math.max(...FarmBands.map((band) => band.maximumLb));
</script>

<section class="panel">
	<h3 class="mb-1 text-xl text-volt-300">The fish farm</h3>
	<p class="mb-4 text-sm text-mist-400">
		This week's list for your region. A flat price per band whatever each fish turns out to be — the luck of the draw is the point. Delivery
		{formatMoney(FarmDelivery.CostPerOrder)} an order; they arrive next fishery day. Nothing over {heaviestFarmLb} lb ever comes from the farm.
	</p>
	<form method="POST" action="?/buyFromFarm">
		<ul class="divide-y divide-carbon-700/60">
			{#each farmStock as band (band.key)}
				<FarmBandRow {band} bind:count={order[band.key]} />
			{/each}
		</ul>
		{#if isTooFull}
			<p class="mt-3 text-xs text-danger-400">The farm won't deliver past {StockingDensity.FarmRefusesAboveLbPerAcre} lb an acre — that order would overfill your water.</p>
		{/if}
		<div class="mt-4 flex items-center gap-3">
			<span class="text-sm text-mist-400">{fishCount} fish{fishCount > 0 ? ` + ${formatMoney(FarmDelivery.CostPerOrder)} delivery` : ''}</span>
			<button class="button-primary ml-auto" disabled={fishCount === 0 || isTooFull}>Order for {formatMoney(totalCost)}</button>
		</div>
	</form>
</section>
