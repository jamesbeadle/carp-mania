<script lang="ts">
	import { describeTerrain, terrainInFrontOfSwim } from '$lib/domain/fishing/castTerrain';
	import { defaultRodSetup, MaximumRods, type RodSetup } from '$lib/domain/tackle/rodSetup';
	import type { Lake, Swim } from '$lib/domain/types';
	import type { Season } from '$lib/domain/world/seasons';
	import { BedTypeLabels, SwimFeatureLabels } from '$lib/format/labels';
	import RodSetupCard from './RodSetupCard.svelte';

	interface Props {
		lake: Lake;
		swim: Swim;
		season: Season;
		overallSkill: number;
		savedRods: RodSetup[];
		onReady: (setups: RodSetup[]) => void;
	}

	let { lake, swim, season, overallSkill, savedRods, onReady }: Props = $props();

	const hasSavedRods = savedRods.length > 0;
	const startingSetups = Array.from({ length: MaximumRods }, (_, index) => structuredClone(savedRods[index] ?? defaultRodSetup()));
	let setups = $state<RodSetup[]>(startingSetups);
	let rodCount = $state(hasSavedRods ? savedRods.length : MaximumRods);
	const HintsUnlockAtSkill = 40;
	const isShowingHints = $derived(overallSkill >= HintsUnlockAtSkill);
	const terrainInFront = $derived(terrainInFrontOfSwim(lake, swim));
</script>

<section class="panel mb-4">
	<p class="stat-label">Tackle up at</p>
	<h2 class="text-2xl text-volt-300">{swim.name}</h2>
	<p class="mt-1 text-sm text-mist-400">
		Straight out in front: {describeTerrain(terrainInFront, BedTypeLabels, SwimFeatureLabels)} · transparency {Math.round(Number(lake.transparency))}% · season: {season.name}
	</p>
	<p class="mt-1 text-xs text-mist-400">The spot you cast to decides the bottom, the depth and the feature — the readouts below assume the water straight out from the peg.</p>
	{#if hasSavedRods}
		<p class="mt-2 text-xs text-volt-300">Your rods are set up as you left them last time. Change anything you like — it's remembered when you start fishing.</p>
	{/if}
	{#if !isShowingHints}
		<p class="mt-2 text-xs text-mist-400">Match readouts unlock at skill {HintsUnlockAtSkill}. Until then, fish it by feel: clear line in clear water, matt hooks, rigs that suit the bottom, bait the lake has been fed on.</p>
	{/if}
	<label class="mt-3 block w-40">
		<span class="stat-label">Rods (max {MaximumRods})</span>
		<select bind:value={rodCount} class="field">{#each [1, 2, 3] as count (count)}<option value={count}>{count}</option>{/each}</select>
	</label>
</section>

<div class="grid gap-4 md:grid-cols-3">
	{#each setups.slice(0, rodCount) as _, index (index)}
		<RodSetupCard bind:setup={setups[index]} rodNumber={index + 1} {lake} terrain={terrainInFront} {isShowingHints} />
	{/each}
</div>

<button class="button-primary mt-4 px-8 py-3 text-lg" onclick={() => onReady(setups.slice(0, rodCount))}>Start fishing</button>
