<script lang="ts">
	import { priceOfCarp } from '$lib/domain/economy';
	import type { Carp } from '$lib/domain/types';
	import { formatMoney } from '$lib/format/money';
	import StockTable from '../StockTable.svelte';

	let { carp }: { carp: Carp[] } = $props();

	let count = $state(5);
	let weightLb = $state(20);
	const cost = $derived(priceOfCarp(weightLb) * count);
</script>

<section class="panel">
	<h3 class="mb-1 text-xl text-volt-300">The stock</h3>
	<p class="mb-4 text-sm text-mist-400">{carp.length} identified carp. Bigger fish cost a lot more — above 25 lb the price climbs steeply.</p>
	<form method="POST" action="?/stockCarp" class="mb-5 grid gap-2 sm:grid-cols-[auto_auto_1fr] sm:items-end">
		<label>
			<span class="stat-label">How many</span>
			<input name="count" type="number" min="1" max="50" bind:value={count} class="field w-24" />
		</label>
		<label>
			<span class="stat-label">Around (lb)</span>
			<input name="weightLb" type="number" min="5" max="45" bind:value={weightLb} class="field w-24" />
		</label>
		<button class="button-primary">Stock for {formatMoney(cost)}</button>
	</form>
	<StockTable {carp} />
</section>
