<script lang="ts">
	import { headCountIn } from '$lib/domain/stock/headCount';
	import type { Shoal } from '$lib/domain/stock/shoals';
	import type { Carp, Lake } from '$lib/domain/types';
	import { ceilingWords, lakeCeilingOf } from '$lib/domain/water/lakeCeiling';
	import type { LakeSpecies } from '$lib/domain/water/species';

	let { lake, carp, shoals, species }: { lake: Lake; carp: Carp[]; shoals: Shoal[]; species: LakeSpecies[] } = $props();

	const reading = $derived(lakeCeilingOf(lake, headCountIn(carp, shoals), species));
</script>

<div class="rounded-xl border border-carbon-700/60 bg-carbon-900/60 p-4">
	<p class="stat-label">What it will grow</p>
	<p class="text-2xl text-volt-300">{reading.ceilingLb} lb <span class="text-base text-mist-400">of a possible {reading.regionCeilingLb} lb here</span></p>
	<p class="mt-1 text-xs text-mist-200">{ceilingWords(reading)}</p>
</div>
