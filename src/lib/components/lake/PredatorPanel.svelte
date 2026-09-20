<script lang="ts">
	import { PikeRules, Prices } from '$lib/domain/economy';
	import { PikeFoodOrder, roomForMorePike, sensiblePikeMaximumFor, whyNoRoomForPike } from '$lib/domain/pikeStocking';
	import type { Lake } from '$lib/domain/types';
	import { formatMoney } from '$lib/format/money';
	import StatRow from '../stats/StatRow.svelte';
	import AboutToggle from './AboutToggle.svelte';

	let { lake, sickCarpCount }: { lake: Lake; sickCarpCount: number } = $props();

	const UsualPikeOrder = 2;
	let foodUnits = $state(10);
	const room = $derived(roomForMorePike(lake));
	const noRoom = $derived(whyNoRoomForPike(lake));
	const usualOrder = $derived(Math.min(UsualPikeOrder, room));
	const daysOfPikeFood = $derived(lake.pike_count === 0 ? 0 : Math.floor(Number(lake.pike_food) / (lake.pike_count * PikeRules.FoodEatenPerPikePerDay)));
	const stats = $derived([
		{ label: 'Pike', value: String(lake.pike_count), caption: `of ${sensiblePikeMaximumFor(lake.acres)} this water holds`, tone: 'volt' as const },
		{ label: 'Pike food', value: Number(lake.pike_food).toFixed(0), caption: `${daysOfPikeFood} days` },
		{ label: 'Sick carp', value: String(sickCarpCount), caption: `under ${PikeRules.SickCarpConditionBelow} condition` },
		{ label: 'Pike grow to', value: `${PikeRules.MaximumWeightLb} lb`, caption: 'at most' }
	]);
</script>

<section class="panel">
	<h3 class="mb-3 text-xl text-volt-300">Predators</h3>
	<StatRow {stats} />
	<div class="mt-5 grid gap-3 sm:grid-cols-2">
		{#if noRoom}
			<p class="self-end text-sm text-mist-400">{noRoom}</p>
		{:else}
			<form method="POST" action="?/stockPike" class="flex items-end gap-2">
				<label class="flex min-w-0 flex-1 flex-col gap-1">
					<span class="stat-label">Pike · {formatMoney(Prices.Pike)} each · room for {room}</span>
					<input name="count" type="number" min="1" max={room} step="1" value={usualOrder} class="field" />
				</label>
				<button class="button-primary">Introduce</button>
			</form>
		{/if}
		<form method="POST" action="?/stockPikeFood" class="flex items-end gap-2">
			<label class="flex min-w-0 flex-1 flex-col gap-1">
				<span class="stat-label">Pike food · {formatMoney(Prices.PikeFoodPerUnit)} a unit</span>
				<input name="units" type="number" min={PikeFoodOrder.MinimumUnits} max={PikeFoodOrder.MaximumUnits} bind:value={foodUnits} class="field" />
			</label>
			<button class="button-secondary">Add</button>
		</form>
	</div>
	<div class="mt-4">
		<AboutToggle title="Why pike">Slow swimmers, fast at the strike: pike ambush the sick carp and cannot catch the strong ones. Without pike food they die back. They also eat crayfish, which cleans the water.</AboutToggle>
	</div>
</section>
