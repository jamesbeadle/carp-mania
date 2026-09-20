<script lang="ts">
	import { matchTackleToWater } from '$lib/domain/fishing/tackleMatch';
	import { castDistanceFeet } from '$lib/domain/tackle/castDistance';
	import type { TackleKind } from '$lib/domain/tackle/kinds';
	import { kitOf, SetupSlots, type RodSetup } from '$lib/domain/tackle/rodSetup';
	import { landsUpToLb } from '$lib/domain/tackle/rods';
	import type { OwnedItem } from '$lib/domain/tackle/tackleBox';
	import type { Terrain } from '$lib/domain/layout/terrainAt';
	import type { Lake } from '$lib/domain/types';
	import MatchReadout from './MatchReadout.svelte';
	import RodWarnings from './RodWarnings.svelte';
	import SlotSelect from './SlotSelect.svelte';

	interface Props {
		setup: RodSetup;
		rodNumber: number;
		lake: Lake;
		terrain: Terrain;
		box: OwnedItem[];
		isShowingHints: boolean;
		onCopyToEveryRod: (() => void) | null;
	}

	let { setup = $bindable(), rodNumber, lake, terrain, box, isShowingHints, onCopyToEveryRod }: Props = $props();

	const SlotLabels: Record<TackleKind, string> = { rod: 'Rod', reel: 'Reel', line: 'Line', hook: 'Hook', rig: 'Rig', lead: 'Lead', tubing: 'Tubing', bait: 'Bait' };
	const kit = $derived(kitOf(setup));
	const match = $derived(kit ? matchTackleToWater(kit, lake, terrain) : null);
</script>

<section class="panel space-y-3">
	<div class="flex items-baseline gap-3">
		<h3 class="text-lg text-volt-300">Rod {rodNumber}</h3>
		{#if onCopyToEveryRod}<button type="button" class="ml-auto text-xs text-surge-400 hover:underline" onclick={onCopyToEveryRod}>Same on every rod</button>{/if}
	</div>
	<div class="grid grid-cols-2 gap-2 md:grid-cols-1">
		{#each SetupSlots as slot (slot)}
			<SlotSelect {slot} label={SlotLabels[slot]} {box} bind:value={setup[slot]} />
		{/each}
	</div>
	{#if kit}
		<p class="text-xs text-mist-400">Casts {castDistanceFeet(kit)} ft · lands up to {landsUpToLb(kit.rod.rod)} lb</p>
		<RodWarnings {kit} {box} />
	{/if}
	{#if isShowingHints && match}<MatchReadout {match} />{/if}
</section>
