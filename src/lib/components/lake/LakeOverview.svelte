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
</script>

<section class="panel">
	<form method="POST" action="?/rename" class="mb-4 flex gap-2">
		<input name="name" value={lake.name} class="field text-2xl font-display" aria-label="Lake name" />
		<button class="button-secondary">Rename</button>
	</form>
	<dl class="grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
		<div><dt class="stat-label">Money</dt><dd class="text-2xl text-volt-300">{formatMoney(profile.money)}</dd></div>
		<div><dt class="stat-label">Reputation</dt><dd class="text-2xl">{Math.round(Number(lake.reputation))}<span class="text-sm text-mist-400">/100</span></dd></div>
		<div><dt class="stat-label">Anglers a day</dt><dd class="text-2xl">{anglersToday}</dd></div>
		<div><dt class="stat-label">They'll pay up to</dt><dd class="text-2xl">{formatMoney(willingness)}</dd></div>
	</dl>
	<div class="mt-4 grid gap-3 lg:grid-cols-3"><CeilingReading {lake} {carp} {shoals} {species} /><DrawReading {carp} {shoals} /><DifficultyReading {lake} {carp} {shoals} isOwner /></div>
</section>
