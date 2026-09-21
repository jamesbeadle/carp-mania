<script lang="ts">
	import type { HallOfFameCatch } from '$lib/contracts/HallOfFame';
	import type { WorldActivity } from '$lib/contracts/WorldActivity';
	import type { WorldPin } from '$lib/contracts/WorldPin';
	import type { RegionCode } from '$lib/domain/world/regionCodes';
	import type { GlobeArc, GlobePulse } from './Globe.svelte';
	import GreatestCatchesBoard from './GreatestCatchesBoard.svelte';
	import LiveTicker from './LiveTicker.svelte';
	import PostcardPopover from './PostcardPopover.svelte';
	import WorldStage from './WorldStage.svelte';

	interface Props {
		pins: WorldPin[];
		hasAnyPins: boolean;
		selectedLakeId: string | null;
		isSelectedAFavourite: boolean;
		arcs: GlobeArc[];
		pulses: GlobePulse[];
		greatest: HallOfFameCatch[];
		feed: WorldActivity[];
		viewerId: string | null;
		onSelect: (pin: WorldPin | null) => void;
		onPickLake: (lakeId: string) => void;
	}

	let { pins, hasAnyPins, selectedLakeId, isSelectedAFavourite, arcs, pulses, greatest, feed, viewerId, onSelect, onPickLake }: Props = $props();

	let stage: WorldStage;

	export function flyTo(latitude: number, longitude: number, zoom?: number) {
		stage.flyTo(latitude, longitude, zoom);
	}
	export function flyToRandom() {
		stage.flyToRandom();
	}
	export function flyToRegion(region: RegionCode) {
		stage.flyToRegion(region);
	}
</script>

<div class="relative">
	<WorldStage bind:this={stage} {pins} {hasAnyPins} selectedPinId={selectedLakeId} {arcs} {pulses} {onSelect} />
	<div class="pointer-events-none absolute inset-x-3 top-3 bottom-3 flex flex-col justify-between gap-3">
		<div class="flex items-start justify-between gap-3">
			<div class="pointer-events-auto hidden w-80 lg:block"><GreatestCatchesBoard catches={greatest} {selectedLakeId} {viewerId} onPick={onPickLake} /></div>
			{#if selectedLakeId}<div class="pointer-events-auto ml-auto hidden w-full max-w-sm lg:block"><PostcardPopover lakeId={selectedLakeId} isFavourite={isSelectedAFavourite} onClose={() => onSelect(null)} /></div>{/if}
		</div>
		<div class="pointer-events-auto"><LiveTicker {feed} onPick={onPickLake} /></div>
	</div>
</div>
<div class="mt-3 flex flex-col gap-3 lg:hidden">
	{#if selectedLakeId}<PostcardPopover lakeId={selectedLakeId} isFavourite={isSelectedAFavourite} onClose={() => onSelect(null)} />{/if}
	<GreatestCatchesBoard catches={greatest} {selectedLakeId} {viewerId} onPick={onPickLake} />
</div>
