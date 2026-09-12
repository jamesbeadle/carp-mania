<script lang="ts">
	import { PikeRules, Prices } from '$lib/domain/economy';
	import { PikeFoodOrder, sensiblePikeMaximumFor } from '$lib/domain/pikeStocking';
	import type { Lake } from '$lib/domain/types';
	import { formatMoney } from '$lib/format/money';

	let { lake, sickCarpCount }: { lake: Lake; sickCarpCount: number } = $props();

	let pikeCount = $state(2);
	let foodUnits = $state(10);
	const mostPike = $derived(sensiblePikeMaximumFor(lake.acres));
	const daysOfPikeFood = $derived(lake.pike_count === 0 ? 0 : Math.floor(Number(lake.pike_food) / (lake.pike_count * PikeRules.FoodEatenPerPikePerDay)));
</script>

<section class="panel">
	<h3 class="mb-1 text-xl text-volt-300">Predators</h3>
	<p class="mb-4 text-sm text-mist-400">
		Pike are slow swimmers but fast at the strike: they ambush the sick carp and can't catch the strong ones. They never grow past
		{PikeRules.MaximumWeightLb} lb here. Feed them perch, rudd and roach or they die back. They also eat crayfish, which cleans the water.
	</p>
	<dl class="mb-4 grid grid-cols-3 gap-3 text-sm">
		<div><dt class="stat-label">Pike</dt><dd class="text-2xl">{lake.pike_count}</dd></div>
		<div><dt class="stat-label">Pike food</dt><dd class="text-2xl">{Number(lake.pike_food).toFixed(0)} <span class="text-sm text-mist-400">({daysOfPikeFood} days)</span></dd></div>
		<div><dt class="stat-label">Sick carp</dt><dd class="text-2xl" class:text-danger-400={sickCarpCount > 0}>{sickCarpCount}</dd></div>
	</dl>
	<div class="grid gap-3 sm:grid-cols-2">
		<form method="POST" action="?/stockPike" class="flex items-end gap-2">
			<label class="flex-1">
				<span class="stat-label">Pike ({formatMoney(Prices.Pike)} each, up to {mostPike} for this water)</span>
				<input name="count" type="number" min="1" max={mostPike} step="1" bind:value={pikeCount} class="field" />
			</label>
			<button class="button-primary">Introduce</button>
		</form>
		<form method="POST" action="?/stockPikeFood" class="flex items-end gap-2">
			<label class="flex-1">
				<span class="stat-label">Pike food units ({formatMoney(Prices.PikeFoodPerUnit)} each)</span>
				<input name="units" type="number" min={PikeFoodOrder.MinimumUnits} max={PikeFoodOrder.MaximumUnits} bind:value={foodUnits} class="field" />
			</label>
			<button class="button-secondary">Add</button>
		</form>
	</div>
</section>
