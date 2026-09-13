<script lang="ts">
	import type { Carp, Lake } from '$lib/domain/types';
	import { formatMoney } from '$lib/format/money';
	import { formatWeight } from '$lib/format/weight';
	import GoFishingButton from '../game/GoFishingButton.svelte';

	let { lake, carp }: { lake: Lake; carp: Carp[] } = $props();

	const heaviest = $derived(carp.length > 0 ? Math.max(...carp.map((fish) => Number(fish.weight_lb))) : 0);
	const sickCount = $derived(carp.filter((fish) => Number(fish.condition) < 35).length);
</script>

<section class="panel">
	<p class="stat-label">My fishery</p>
	<h2 class="mb-4 text-3xl text-volt-300">{lake.name}</h2>
	<dl class="grid grid-cols-2 gap-4 text-sm">
		<div><dt class="stat-label">Reputation</dt><dd class="text-2xl">{Math.round(Number(lake.reputation))}</dd></div>
		<div><dt class="stat-label">Day ticket</dt><dd class="text-2xl">{formatMoney(lake.day_ticket_fee)}</dd></div>
		<div><dt class="stat-label">Stock</dt><dd class="text-2xl">{carp.length} carp</dd></div>
		<div><dt class="stat-label">Biggest</dt><dd class="text-2xl">{formatWeight(heaviest)}</dd></div>
	</dl>
	{#if sickCount > 0}
		<p class="mt-3 text-sm text-danger-400">{sickCount} carp in poor condition — check the water, or let the pike do their job.</p>
	{/if}
	<div class="mt-5 flex gap-3">
		<a href="/lake" class="button-primary">Run the fishery</a>
		<GoFishingButton lakeId={lake.id} words="Fish my own water" buttonClass="button-secondary" />
	</div>
</section>
