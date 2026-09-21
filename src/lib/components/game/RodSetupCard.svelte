<script lang="ts">
	import { matchTackleToWater } from '$lib/domain/fishing/tackleMatch';
	import type { TackleKind } from '$lib/domain/tackle/kinds';
	import { kitOf, SetupSlots, type RodSetup } from '$lib/domain/tackle/rodSetup';
	import type { OwnedItem } from '$lib/domain/tackle/tackleBox';
	import type { Terrain } from '$lib/domain/layout/terrainAt';
	import type { Lake } from '$lib/domain/types';
	import RodHeadline from './RodHeadline.svelte';
	import RodWarnings from './RodWarnings.svelte';
	import SlotTiles from './SlotTiles.svelte';

	interface Props {
		setup: RodSetup;
		rodNumber: number;
		lake: Lake;
		terrain: Terrain;
		box: OwnedItem[];
		isShowingHints: boolean;
		hintsUnlockAt: number;
		onCopyToEveryRod: (() => void) | null;
	}

	let { setup = $bindable(), rodNumber, lake, terrain, box, isShowingHints, hintsUnlockAt, onCopyToEveryRod }: Props = $props();

	const SlotLabels: Record<TackleKind, string> = { rod: 'Rod', reel: 'Reel', line: 'Line', hook: 'Hook', rig: 'Rig', lead: 'Lead', tubing: 'Tubing', bait: 'Bait' };
	const kit = $derived(kitOf(setup));
	const match = $derived(kit ? matchTackleToWater(kit, lake, terrain) : null);
</script>

<section class="panel min-w-0 space-y-3">
	<div class="flex items-baseline gap-3">
		<h3 class="font-display text-2xl font-extrabold text-volt-300 italic">Rod {rodNumber}</h3>
		{#if onCopyToEveryRod}<button type="button" class="ml-auto text-xs text-surge-400 hover:underline" onclick={onCopyToEveryRod}>Same on every rod</button>{/if}
	</div>
	{#if kit && match}
		<RodHeadline {kit} {match} {isShowingHints} {hintsUnlockAt} />
		<RodWarnings {kit} {box} />
	{/if}
	<div class="space-y-3">
		{#each SetupSlots as slot (slot)}
			<SlotTiles {slot} label={SlotLabels[slot]} {box} bind:value={setup[slot]} />
		{/each}
	</div>
</section>
