<script lang="ts">
	import { feedStolenShare, nuisanceBiteShare, SpeciesShare, type LakeSpecies } from '$lib/domain/water/species';
	import StatTile from '../stats/StatTile.svelte';

	let { species, acres }: { species: LakeSpecies[]; acres: number } = $props();

	const HeavyFromShareOfWorst = 0.6;
	const stolen = $derived(feedStolenShare(species, acres));
	const nuisance = $derived(nuisanceBiteShare(species, acres));
	const stolenShareOfWorst = $derived(stolen / SpeciesShare.MostStolen);
	const nuisanceShareOfWorst = $derived(nuisance / SpeciesShare.MostNuisance);
	const percent = (share: number) => `${Math.round(share * 100)}%`;
	const toneFor = (shareOfWorst: number) => (shareOfWorst >= HeavyFromShareOfWorst ? 'warning' : 'volt');
	const stolenVerdict = $derived(stolenShareOfWorst >= HeavyFromShareOfWorst ? 'The carp are going short — net the silvers' : 'The carp get most of what you put in');
	const nuisanceVerdict = $derived(nuisanceShareOfWorst >= HeavyFromShareOfWorst ? 'Too many bites are not carp — net the silvers' : 'Most bites here are carp');
</script>

<div class="grid gap-3 @min-[52rem]:grid-cols-2">
	<StatTile label="Feed stolen" value={percent(stolen)} caption="of {percent(SpeciesShare.MostStolen)} at worst" share={stolenShareOfWorst} tone={toneFor(stolenShareOfWorst)} verdict={stolenVerdict}>
		{#snippet why()}
			Every other mouth in the water eats before the carp do. More silvers an acre means less of each feed drop reaches a carp, up to a ceiling of {percent(SpeciesShare.MostStolen)}.
		{/snippet}
	</StatTile>
	<StatTile label="Nuisance bites" value={percent(nuisance)} caption="of {percent(SpeciesShare.MostNuisance)} at worst" share={nuisanceShareOfWorst} tone={toneFor(nuisanceShareOfWorst)} verdict={nuisanceVerdict}>
		{#snippet why()}
			The share of bites that turn out to be something other than a carp. Bream and roach take a bait first; tench read as a healthy water and cost anglers less patience.
		{/snippet}
	</StatTile>
</div>
