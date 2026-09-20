<script lang="ts">
	import type { AnglerWater } from '$lib/contracts/AnglerPublicProfile';
	import { RegionCatalogue } from '$lib/domain/world/regions';
	import { formatMoney } from '$lib/format/money';
	import GoFishingButton from '../game/GoFishingButton.svelte';
	import StatRow from '../stats/StatRow.svelte';

	let { waters, anglerName }: { waters: AnglerWater[]; anglerName: string } = $props();

	const AcresDecimals = 1;

	function statsOf(water: AnglerWater) {
		return [
			{ label: 'Reputation', value: String(Math.round(Number(water.reputation))), tone: 'volt' as const },
			{ label: 'Water', value: Number(water.acres).toFixed(AcresDecimals), caption: 'acres' },
			{ label: 'Day ticket', value: formatMoney(water.day_ticket_fee), caption: 'a day' }
		];
	}
</script>

<section class="panel space-y-6">
	<p class="stat-label">{anglerName}'s {waters.length > 1 ? 'waters' : 'water'}</p>
	{#each waters as water (water.id)}
		<div>
			<h2 class="text-3xl text-volt-300">{water.name}</h2>
			<p class="mb-4 text-sm text-mist-400">{RegionCatalogue[water.region].label}</p>
			<StatRow stats={statsOf(water)} />
			<div class="mt-5 flex flex-wrap items-center justify-end gap-3">
				<a href="/lakes/{water.id}" class="button-secondary">Look around</a>
				<GoFishingButton lakeId={water.id} words="Fish here" />
			</div>
		</div>
	{/each}
	{#if waters.length === 0}
		<h2 class="mb-2 text-3xl text-volt-300">No water open to anglers</h2>
		<p class="text-sm text-mist-400">Either they have not found their water yet, or the gates are closed.</p>
	{/if}
</section>
