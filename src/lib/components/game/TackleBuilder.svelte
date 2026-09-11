<script lang="ts">
	import { defaultRodSetup, MaximumRods, type RodSetup } from '$lib/domain/tackle/rodSetup';
	import type { Lake, Swim } from '$lib/domain/types';
	import { BedTypeLabels, SwimFeatureLabels } from '$lib/format/labels';
	import RodSetupCard from './RodSetupCard.svelte';

	let { lake, swim, overallSkill, onReady }: { lake: Lake; swim: Swim; overallSkill: number; onReady: (setups: RodSetup[]) => void } = $props();

	let setups = $state<RodSetup[]>([defaultRodSetup(), defaultRodSetup(), defaultRodSetup()]);
	let rodCount = $state(MaximumRods);
	const HintsUnlockAtSkill = 40;
	const isShowingHints = $derived(overallSkill >= HintsUnlockAtSkill);
</script>

<section class="panel mb-4">
	<p class="stat-label">Tackle up at</p>
	<h2 class="text-2xl text-gold-300">{swim.name}</h2>
	<p class="mt-1 text-sm text-mist-400">
		{BedTypeLabels[swim.bed_type]} bottom · {swim.depth_feet} ft · {SwimFeatureLabels[swim.feature]} · transparency {Math.round(Number(lake.transparency))}%
	</p>
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
		<RodSetupCard bind:setup={setups[index]} rodNumber={index + 1} {lake} {swim} {isShowingHints} />
	{/each}
</div>

<button class="button-primary mt-4 px-8 py-3 text-lg" onclick={() => onReady(setups.slice(0, rodCount))}>Start fishing</button>
