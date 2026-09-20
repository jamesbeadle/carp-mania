<script lang="ts">
	import { feedStolenShare, nettingQuoteFor, nuisanceBiteShare, SpeciesCatalogue, SpeciesNames, type LakeSpecies } from '$lib/domain/water/species';
	import type { Lake } from '$lib/domain/types';
	import { formatMoney } from '$lib/format/money';

	let { lake, species }: { lake: Lake; species: LakeSpecies[] } = $props();

	let chosen = $state<(typeof SpeciesNames)[number]>('tench');
	let count = $state(50);
	const acres = $derived(Number(lake.acres));
	const stolen = $derived(Math.round(feedStolenShare(species, acres) * 100));
	const nuisance = $derived(Math.round(nuisanceBiteShare(species, acres) * 100));
	const netting = $derived(nettingQuoteFor(acres));
	const price = $derived(Math.max(1, Math.floor(count)) * SpeciesCatalogue[chosen].pricePerFish);
	const hasSilvers = $derived(species.some((line) => line.count > 0));
</script>

<section class="panel">
	<h3 class="mb-1 text-xl text-volt-300">What else is in it</h3>
	<p class="mb-3 text-sm text-mist-400">The other fish steal {stolen}% of the feed and turn {nuisance}% of the bites into something that is not a carp.</p>
	<ul class="mb-4 divide-y divide-carbon-700/60 text-sm">
		{#each species.filter((line) => line.count > 0) as line (line.species)}
			{@const profile = SpeciesCatalogue[line.species]}
			{@const label = profile.label.toLowerCase()}
			<li class="flex items-center gap-3 py-1.5">
				<span class="font-medium text-mist-100">{line.count} {label}</span><span class="text-xs text-mist-400">{profile.note}</span>
			</li>
		{:else}
			<li class="py-1.5 text-mist-400">Nothing but carp.</li>
		{/each}
	</ul>
	<div class="flex flex-wrap items-end gap-3">
		<form method="POST" action="?/stockCoarseFish" class="flex flex-wrap items-end gap-2">
			<label class="text-xs text-mist-400">Species<select name="species" bind:value={chosen} class="field mt-1">{#each SpeciesNames as name (name)}<option value={name}>{SpeciesCatalogue[name].label}</option>{/each}</select></label>
			<label class="text-xs text-mist-400">How many<input name="count" type="number" min="1" max="5000" bind:value={count} class="field mt-1 w-24" /></label>
			<button class="button-secondary px-3 py-1 text-base">Stock for {formatMoney(price)}</button>
		</form>
		<form method="POST" action="?/netTheSilvers">
			<button class="button-secondary px-3 py-1 text-base" disabled={!hasSilvers}>Net the silvers for {formatMoney(netting.cost)}</button>
		</form>
	</div>
</section>
