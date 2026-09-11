<script lang="ts">
	import type { WorldPin } from '$lib/contracts/WorldPin';
	import type { RegionCode } from '$lib/domain/world/regionCodes';
	import { regionCentre, regionZoom } from '$lib/game/globe/regionOnGlobe';
	import Globe, { type GlobeArc, type GlobePulse } from './Globe.svelte';
	import PinCard from './PinCard.svelte';

	interface Props {
		pins: WorldPin[];
		hasAnyPins: boolean;
		selectedPinId: string | null;
		arcs: GlobeArc[];
		pulses: GlobePulse[];
		onSelect: (pin: WorldPin) => void;
	}

	let { pins, hasAnyPins, selectedPinId, arcs, pulses, onSelect }: Props = $props();

	const NoWatersYet = 'No waters on the map yet — yours will be the first.';
	const NothingMatches = 'No waters match those filters. Loosen them, or spin the globe anyway.';

	let globe: Globe;
	let hoveredPin = $state<WorldPin | null>(null);
	let pointer = $state({ x: 0, y: 0 });
	let stageWidth = $state(0);

	const emptyMessage = $derived(emptyMessageFor(hasAnyPins, pins.length));

	function emptyMessageFor(hasAny: boolean, shownCount: number) {
		if (!hasAny) return NoWatersYet;
		if (shownCount === 0) return NothingMatches;
		return null;
	}

	export function flyTo(latitude: number, longitude: number, zoom?: number) {
		globe.flyTo(latitude, longitude, zoom);
	}

	export function flyToRandom() {
		globe.flyToRandom();
	}

	export function flyToRegion(region: RegionCode) {
		const centre = regionCentre(region);
		globe.flyTo(centre.latitude, centre.longitude, regionZoom(region));
	}

	function trackPointer(event: PointerEvent) {
		const bounds = (event.currentTarget as HTMLElement).getBoundingClientRect();
		pointer = { x: event.clientX - bounds.left, y: event.clientY - bounds.top };
	}
</script>

<div class="relative" role="presentation" bind:clientWidth={stageWidth} onpointermove={trackPointer}>
	<Globe bind:this={globe} {pins} {selectedPinId} {arcs} {pulses} onPinClick={onSelect} onPinHover={(pin) => (hoveredPin = pin)} />
	{#if hoveredPin}
		<PinCard pin={hoveredPin} x={pointer.x} y={pointer.y} isOnTheLeft={pointer.x > stageWidth / 2} />
	{/if}
	{#if emptyMessage}
		<p class="pointer-events-none absolute inset-x-6 top-6 rounded-xl border border-carbon-700 bg-carbon-900/90 px-4 py-3 text-center text-sm text-mist-200">{emptyMessage}</p>
	{/if}
</div>
