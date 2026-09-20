<script lang="ts">
	import { describeTerrain, terrainInFrontOfSwim } from '$lib/domain/fishing/castTerrain';
	import { whyTheOwnerRefusesRods } from '$lib/domain/fishing/ownersRules';
	import { defaultRodSetup, isRodSetup, MaximumRods, type RodSetup } from '$lib/domain/tackle/rodSetup';
	import { isSetupOwned, ownedItemsIn, type OwnedTackle } from '$lib/domain/tackle/tackleBox';
	import { firstOwnedSetup } from '$lib/game/session/firstOwnedSetup';
	import type { Lake, Swim } from '$lib/domain/types';
	import type { Season } from '$lib/domain/world/seasons';
	import { BedTypeLabels, SwimFeatureLabels } from '$lib/format/labels';
	import RodSetupCard from './RodSetupCard.svelte';
	import SegmentedChoice from './SegmentedChoice.svelte';
	import SizeReachLine from './SizeReachLine.svelte';

	interface Props {
		lake: Lake;
		swim: Swim;
		season: Season;
		rating: number;
		craft: number;
		carpCount: number;
		conditionsShare: number;
		savedRods: RodSetup[];
		owned: OwnedTackle[];
		onReady: (setups: RodSetup[]) => void;
	}

	let { lake, swim, season, rating, craft, carpCount, conditionsShare, savedRods, owned, onReady }: Props = $props();

	const box = ownedItemsIn(owned);
	const usableRods = savedRods.filter((setup) => isRodSetup(setup) && isSetupOwned(owned, setup));
	const hasSavedRods = usableRods.length > 0;
	const fallback = firstOwnedSetup(box) ?? defaultRodSetup();
	const startingSetups = Array.from({ length: MaximumRods }, (_, index) => structuredClone(usableRods[index] ?? fallback));
	const RodCounts = Array.from({ length: MaximumRods }, (_, index) => index + 1);
	const HintsUnlockAtCraft = 40;
	let setups = $state<RodSetup[]>(startingSetups);
	let rodCount = $state(hasSavedRods ? usableRods.length : MaximumRods);
	let chosenRod = $state(0);
	const shownRod = $derived(Math.min(chosenRod, rodCount - 1));
	const rodsInUse = $derived(RodCounts.slice(0, rodCount));
	const isShowingHints = $derived(craft >= HintsUnlockAtCraft);
	const terrainInFront = $derived(terrainInFrontOfSwim(lake, swim));
	const ownersRefusal = $derived(whyTheOwnerRefusesRods(lake, setups.slice(0, rodCount)));

	function copyToEveryRod(from: number) {
		setups = setups.map((setup, index) => (index === from ? setup : structuredClone($state.snapshot(setups[from]))));
	}
</script>

<section class="panel mb-4">
	<p class="stat-label">Tackle up at</p>
	<h2 class="text-2xl text-volt-300">{swim.name}</h2>
	<p class="mt-1 text-sm text-mist-400">
		Straight out in front: {describeTerrain(terrainInFront, BedTypeLabels, SwimFeatureLabels)} · transparency {Math.round(Number(lake.transparency))}% · season: {season.name}
	</p>
	<p class="mt-1 hidden text-xs text-mist-400 sm:block">The spot you cast to decides the bottom, the depth and the feature — the readouts below assume the water straight out from the peg.</p>
	{#if hasSavedRods}
		<p class="mt-2 text-xs text-volt-300">Your rods are set up as you left them last time. Change anything you like — it's remembered when you start fishing.</p>
	{/if}
	<SizeReachLine {lake} {rating} {carpCount} {conditionsShare} terrain={terrainInFront} setup={setups[shownRod]} />
	{#if !isShowingHints}
		<p class="mt-2 text-xs text-mist-400">Match readouts unlock at craft {HintsUnlockAtCraft}. Until then, fish it by feel: clear line in clear water, matt hooks, rigs that suit the bottom, bait the lake has been fed on.</p>
	{/if}
	<div class="mt-3 max-w-xs">
		<p class="stat-label mb-1">Rods</p>
		<SegmentedChoice choices={RodCounts} chosen={rodCount} labelFor={(count) => `${count}`} onChoose={(count) => (rodCount = count)} ariaLabel="How many rods" />
	</div>
</section>

<div class="mb-3 md:hidden">
	<SegmentedChoice choices={rodsInUse} chosen={shownRod + 1} labelFor={(number) => `Rod ${number}`} onChoose={(number) => (chosenRod = number - 1)} ariaLabel="Which rod to set up" />
</div>

<div class="grid gap-4 md:grid-cols-3">
	{#each rodsInUse as rodNumber (rodNumber)}
		<div class={rodNumber === shownRod + 1 ? 'block' : 'hidden md:block'}>
			<RodSetupCard bind:setup={setups[rodNumber - 1]} {rodNumber} {lake} terrain={terrainInFront} {box} {isShowingHints} onCopyToEveryRod={rodCount > 1 ? () => copyToEveryRod(rodNumber - 1) : null} />
		</div>
	{/each}
</div>

<div class="start-bar sticky bottom-0 -mx-4 mt-4 flex flex-col border-t border-carbon-700 bg-carbon-950/90 px-4 py-3 backdrop-blur md:items-end">
	{#if ownersRefusal}<p class="mb-2 text-xs text-danger-400">{ownersRefusal}</p>{/if}
	<button class="button-primary w-full px-8 py-3 text-lg md:w-auto" disabled={ownersRefusal !== null} onclick={() => onReady(setups.slice(0, rodCount))}>Start fishing with {rodCount} {rodCount === 1 ? 'rod' : 'rods'}</button>
</div>

<style>
	.start-bar {
		padding-bottom: max(0.75rem, env(safe-area-inset-bottom));
	}
</style>
