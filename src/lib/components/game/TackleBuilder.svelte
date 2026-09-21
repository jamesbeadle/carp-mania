<script lang="ts">
	import { untrack } from 'svelte';
	import { terrainInFrontOfSwim } from '$lib/domain/fishing/castTerrain';
	import { whyTheOwnerRefusesRods } from '$lib/domain/fishing/ownersRules';
	import type { RodSet } from '$lib/domain/tackle/rodSets';
	import { MaximumRods, type RodSetup } from '$lib/domain/tackle/rodSetup';
	import { ownedItemsIn, type OwnedTackle } from '$lib/domain/tackle/tackleBox';
	import type { Lake, Swim } from '$lib/domain/types';
	import type { Season } from '$lib/domain/world/seasons';
	import { LastTimeSetId, RodSetShelf } from '$lib/game/session/rodSetShelf.svelte';
	import { rodCountFor, setupsFor, usableRodsOf } from '$lib/game/session/startingSetups';
	import RodSetupCard from './RodSetupCard.svelte';
	import SegmentedChoice from './SegmentedChoice.svelte';
	import TackleUpHeader from './TackleUpHeader.svelte';

	interface Props {
		lake: Lake;
		swim: Swim;
		season: Season;
		rating: number;
		craft: number;
		carpCount: number;
		conditionsShare: number;
		streakDays: number;
		savedRods: RodSetup[];
		rodSets: RodSet[];
		owned: OwnedTackle[];
		onReady: (setups: RodSetup[]) => void;
	}

	let { lake, swim, season, rating, craft, carpCount, conditionsShare, streakDays, savedRods, rodSets, owned, onReady }: Props = $props();

	const HintsUnlockAtCraft = 40;
	const RodCounts = Array.from({ length: MaximumRods }, (_, index) => index + 1);
	const box = untrack(() => ownedItemsIn(owned));
	const lastTime = untrack(() => usableRodsOf(savedRods, owned));
	const hasLastTime = lastTime.length > 0;
	const shelf = new RodSetShelf(untrack(() => rodSets), hasLastTime);
	const rodsToStartWith = untrack(() => (shelf.chosen ? usableRodsOf(shelf.chosen.rods, owned) : lastTime));
	let setups = $state<RodSetup[]>(setupsFor(rodsToStartWith, box));
	let rodCount = $state(rodCountFor(rodsToStartWith));
	let chosenRod = $state(0);
	const shownRod = $derived(Math.min(chosenRod, rodCount - 1));
	const rodsInUse = $derived(RodCounts.slice(0, rodCount));
	const isShowingHints = $derived(craft >= HintsUnlockAtCraft);
	const terrainInFront = $derived(terrainInFrontOfSwim(lake, swim));
	const rodsChosen = $derived(setups.slice(0, rodCount));
	const ownersRefusal = $derived(whyTheOwnerRefusesRods(lake, rodsChosen));

	function copyToEveryRod(from: number) {
		setups = setups.map((setup, index) => (index === from ? setup : structuredClone($state.snapshot(setups[from]))));
	}

	function pickSet(setId: string) {
		shelf.choose(setId);
		const rods = setId === LastTimeSetId ? lastTime : usableRodsOf(shelf.chosen?.rods ?? [], owned);
		setups = setupsFor(rods, box);
		rodCount = rodCountFor(rods);
	}

	function startFishing() {
		shelf.markChosenUsed();
		onReady($state.snapshot(rodsChosen));
	}
</script>

<TackleUpHeader {lake} {swim} {season} terrain={terrainInFront} {rating} {carpCount} {conditionsShare} {streakDays} shownSetup={setups[shownRod]} {shelf} {hasLastTime} {rodCount} onRodCount={(count) => (rodCount = count)} onPickSet={pickSet} onSaveSet={(name) => shelf.save(name, $state.snapshot(rodsChosen))} />

<div class="mb-3 md:hidden">
	<SegmentedChoice choices={rodsInUse} chosen={shownRod + 1} labelFor={(number) => `Rod ${number}`} onChoose={(number) => (chosenRod = number - 1)} ariaLabel="Which rod to set up" />
</div>

<div class="grid gap-4 md:grid-cols-3">
	{#each rodsInUse as rodNumber (rodNumber)}
		<div class={rodNumber === shownRod + 1 ? 'block min-w-0' : 'hidden min-w-0 md:block'}>
			<RodSetupCard bind:setup={setups[rodNumber - 1]} {rodNumber} {lake} terrain={terrainInFront} {box} {isShowingHints} hintsUnlockAt={HintsUnlockAtCraft} onCopyToEveryRod={rodCount > 1 ? () => copyToEveryRod(rodNumber - 1) : null} />
		</div>
	{/each}
</div>

<div class="start-bar sticky bottom-0 -mx-4 mt-4 flex flex-col border-t border-carbon-700 bg-carbon-950/90 px-4 py-3 backdrop-blur md:items-end">
	{#if ownersRefusal}<p class="mb-2 text-xs text-danger-400">{ownersRefusal}</p>{/if}
	<button class="button-primary w-full px-8 py-3 text-lg md:w-auto" disabled={ownersRefusal !== null} onclick={startFishing}>Start fishing with {rodCount} {rodCount === 1 ? 'rod' : 'rods'}</button>
</div>

<style>
	.start-bar {
		padding-bottom: max(0.75rem, env(safe-area-inset-bottom));
	}
</style>
