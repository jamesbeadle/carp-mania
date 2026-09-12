<script lang="ts">
	import type { AnglerWater } from '$lib/contracts/AnglerPublicProfile';
	import { RegionCatalogue } from '$lib/domain/world/regions';
	import { formatMoney } from '$lib/format/money';

	let { waters, anglerName }: { waters: AnglerWater[]; anglerName: string } = $props();

	const AcresDecimals = 1;
</script>

<section class="panel space-y-6">
	<p class="stat-label">{anglerName}'s {waters.length > 1 ? 'waters' : 'water'}</p>
	{#each waters as water (water.id)}
		<div>
		<h2 class="mb-4 text-3xl text-volt-300">{water.name}</h2>
		<dl class="grid grid-cols-3 gap-4 text-sm">
			<div><dt class="stat-label">Region</dt><dd class="text-mist-100">{RegionCatalogue[water.region].label}</dd></div>
			<div><dt class="stat-label">Reputation</dt><dd class="text-2xl">{Math.round(Number(water.reputation))}</dd></div>
			<div><dt class="stat-label">Water</dt><dd class="text-2xl">{Number(water.acres).toFixed(AcresDecimals)} <span class="text-sm text-mist-400">acres</span></dd></div>
		</dl>
		<div class="mt-5 flex items-center gap-3">
			<span class="text-lg text-volt-300">{formatMoney(water.day_ticket_fee)}<span class="text-xs text-mist-400"> / day</span></span>
			<a href="/lakes/{water.id}" class="button-secondary ml-auto">Look around</a>
			<a href="/fish/{water.id}" class="button-primary">Fish here</a>
		</div>
		</div>
	{/each}
	{#if waters.length === 0}
		<h2 class="mb-2 text-3xl text-volt-300">No water open to anglers</h2>
		<p class="text-sm text-mist-400">Either they have not found their water yet, or the gates are closed.</p>
	{/if}
</section>
