<script lang="ts">
	import type { Shoal } from '$lib/domain/stock/shoals';
	import type { Carp, Lake, Profile } from '$lib/domain/types';
	import DifficultyReading from './DifficultyReading.svelte';
	import CeilingReading from './CeilingReading.svelte';
	import DrawReading from './DrawReading.svelte';
	import type { LakeSpecies } from '$lib/domain/water/species';
	import { anglersArrivingToday, willingnessToPayFor } from '$lib/domain/simulation/visitingAnglers';
	import { formatMoney } from '$lib/format/money';
	import { stockDrawOf } from '$lib/domain/water/stockDraw';
	import StatRow from '../stats/StatRow.svelte';
	import FacilitiesRow from '../facilities/FacilitiesRow.svelte';
	import ClosedForRestocking from './ClosedForRestocking.svelte';
	import { fishInTheWater } from '$lib/domain/stock/stockedToOpen';

	interface Props {
		lake: Lake;
		profile: Profile;
		carp?: Carp[];
		shoals?: Shoal[];
		species?: LakeSpecies[];
	}

	let { lake, profile, carp = [], shoals = [], species = [] }: Props = $props();

	const anglersToday = $derived(anglersArrivingToday(lake, undefined, [], stockDrawOf(carp, shoals)));
	const willingness = $derived(willingnessToPayFor(Number(lake.reputation)));
	const fishCount = $derived(fishInTheWater(carp, shoals));
</script>

<section class="panel @container">
	<form method="POST" action="?/rename" class="mb-4 flex gap-2">
		<input name="name" value={lake.name} class="field text-2xl font-display" aria-label="Lake name" />
		<button class="button-secondary">Rename</button>
	</form>
	<StatRow stats={[{ label: 'Money', value: formatMoney(profile.money), tone: 'volt' }, { label: 'Reputation', value: String(Math.round(Number(lake.reputation))), caption: '/100' }, { label: 'Anglers a day', value: String(anglersToday) }, { label: 'They pay up to', value: formatMoney(willingness) }]} />
	<div class="mt-3"><ClosedForRestocking {fishCount} isOwner /></div>
	<div class="mt-3"><FacilitiesRow built={lake.layout.facilities} emptyWords="No facilities yet — a car park or a lodge is built in Groundworks." /></div>
	<div class="mt-4 grid gap-3 @min-[52rem]:grid-cols-3"><CeilingReading {lake} {carp} {shoals} {species} /><DrawReading {carp} {shoals} /><DifficultyReading {lake} {carp} {shoals} isOwner /></div>
</section>
