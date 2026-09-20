<script lang="ts">
	import { nettingQuoteFor, SpeciesCatalogue, SpeciesNames, type LakeSpecies } from '$lib/domain/water/species';
	import type { Lake } from '$lib/domain/types';
	import { formatMoney } from '$lib/format/money';
	import SpeciesStats from './SpeciesStats.svelte';

	let { lake, species }: { lake: Lake; species: LakeSpecies[] } = $props();

	let chosen = $state<(typeof SpeciesNames)[number]>('tench');
	let count = $state(50);
	const acres = $derived(Number(lake.acres));
	const netting = $derived(nettingQuoteFor(acres));
	const price = $derived(Math.max(1, Math.floor(count)) * SpeciesCatalogue[chosen].pricePerFish);
	const present = $derived(species.filter((line) => line.count > 0));
	const hasSilvers = $derived(present.length > 0);
</script>

<section class="panel @container">
	<h3 class="mb-3 text-xl text-volt-300">What else is in it</h3>
	<SpeciesStats {species} {acres} />
	<ul class="my-4 divide-y divide-carbon-700/60 text-sm">
		{#each present as line (line.species)}
			{@const profile = SpeciesCatalogue[line.species]}
			<li class="flex flex-wrap items-baseline gap-x-3 gap-y-0.5 py-1.5">
				<span class="font-medium whitespace-nowrap text-mist-100">{line.count} {profile.label.toLowerCase()}</span>
				<span class="text-xs text-mist-400">{profile.note}</span>
			</li>
		{:else}
			<li class="py-1.5 text-mist-400">Nothing but carp.</li>
		{/each}
	</ul>
	<div class="flex flex-wrap items-end gap-3">
		<form method="POST" action="?/stockCoarseFish" class="flex flex-wrap items-end gap-2">
			<label class="flex flex-col gap-1 text-xs text-mist-400">
				<span>Species</span>
				<select name="species" bind:value={chosen} class="field">{#each SpeciesNames as name (name)}<option value={name}>{SpeciesCatalogue[name].label}</option>{/each}</select>
			</label>
			<label class="flex flex-col gap-1 text-xs text-mist-400">
				<span>How many</span>
				<input name="count" type="number" min="1" max="5000" bind:value={count} class="field w-24" />
			</label>
			<button class="button-secondary px-3 py-1 text-base">Stock for {formatMoney(price)}</button>
		</form>
		<form method="POST" action="?/netTheSilvers">
			<button class="button-secondary px-3 py-1 text-base" disabled={!hasSilvers}>Net the silvers for {formatMoney(netting.cost)}</button>
		</form>
	</div>
</section>
