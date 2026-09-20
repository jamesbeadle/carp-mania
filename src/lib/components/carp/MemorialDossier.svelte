<script lang="ts">
	import type { MemorialDossier } from '$lib/contracts/MemorialDossier';
	import { DeathCauseWords } from '$lib/domain/memorialTypes';
	import { StrainCatalogue } from '$lib/domain/strains';
	import { formatWhen } from '$lib/format/dates';
	import { formatWeight } from '$lib/format/weight';
	import CarpPortrait from './CarpPortrait.svelte';
	import CatchHistory from './CatchHistory.svelte';
	import FameBadge from './FameBadge.svelte';
	import SaleHistory from './SaleHistory.svelte';
	import StatRow from '../stats/StatRow.svelte';

	let { dossier }: { dossier: MemorialDossier } = $props();

	const fish = $derived(dossier.memorial);
	const stats = $derived([
		{ label: 'Last weighing', value: formatWeight(fish.weight_lb) },
		{ label: 'Best ever', value: formatWeight(dossier.bestEverLb) },
		{ label: 'On the bank', value: `${fish.times_caught}×` },
		{ label: 'Fame', value: String(fish.fame) }
	]);
	const originName = $derived(fish.origin_lake_id ? (dossier.lakeNames[fish.origin_lake_id] ?? null) : null);
</script>

<svelte:head><title>{fish.name} · in memoriam · Carp Mania</title></svelte:head>

<section class="panel">
	<div class="mb-4 flex flex-wrap items-end gap-3">
		<div>
			<p class="stat-label">In memoriam · {StrainCatalogue[fish.strain].label} carp</p>
			<h1 class="text-4xl text-mist-100">{fish.name} · {formatWeight(fish.weight_lb)}</h1>
		</div>
		<FameBadge fame={fish.fame} />
	</div>
	<div class="grayscale-[0.6] opacity-80"><CarpPortrait strain={fish.strain} weightLb={Number(fish.weight_lb)} /></div>
	<p class="my-4 text-sm text-mist-200">
		Died {formatWhen(fish.died_at)} at {#if fish.lake_id}<a href="/lakes/{fish.lake_id}" class="text-volt-300 hover:underline">{fish.lake_name}</a>{:else}{fish.lake_name}{/if}, aged {fish.age_years} — {DeathCauseWords[fish.death_cause]}.
		{#if originName}Came from {originName}.{/if}
	</p>
	<StatRow {stats} />
	<h2 class="mt-6 mb-2 text-xl text-volt-300">Catch history</h2>
	<CatchHistory catches={dossier.catches} />
	{#if dossier.transfers.length > 0}
		<h2 class="mt-6 mb-2 text-xl text-volt-300">Where it lived</h2>
		<SaleHistory transfers={dossier.transfers} lakeNames={dossier.lakeNames} />
	{/if}
	<p class="mt-6 text-xs text-mist-400">A fish in the book cannot be caught, bought or sold. Its record stands.</p>
</section>
