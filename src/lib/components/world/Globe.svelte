<script module lang="ts">
	export type { GlobeArc } from '$lib/game/globe/drawArcs';
	export type { GlobeMode } from '$lib/game/globe/drawGlobeFrame';
	export type { GlobePulse } from '$lib/game/globe/drawPulses';
</script>

<script lang="ts">
	import { untrack } from 'svelte';
	import type { WorldPin } from '$lib/contracts/WorldPin';
	import type { GlobePoint } from '$lib/domain/world/greatCircle';
	import type { RegionCode } from '$lib/domain/world/regionCodes';
	import type { GlobeArc } from '$lib/game/globe/drawArcs';
	import { drawGlobeFrame, type GlobeMode } from '$lib/game/globe/drawGlobeFrame';
	import type { GlobePulse } from '$lib/game/globe/drawPulses';
	import { GlobeInteraction } from '$lib/game/globe/globeInteraction';
	import { startGlobeRenderLoop } from '$lib/game/globe/globeRenderLoop';
	import { GlobeState } from '$lib/game/globe/globeState.svelte';
	import { randomDestination } from '$lib/game/globe/randomDestination';
	import { regionCentre, regionZoom } from '$lib/game/globe/regionOnGlobe';

	interface Props {
		pins: WorldPin[];
		selectedPinId?: string | null;
		mode?: GlobeMode;
		region?: RegionCode | null;
		plot?: GlobePoint | null;
		onPinClick?: (pin: WorldPin) => void;
		onPinHover?: (pin: WorldPin | null) => void;
		onGlobeClick?: (latitude: number, longitude: number) => void;
		arcs?: GlobeArc[];
		pulses?: GlobePulse[];
	}

	let { pins, selectedPinId = null, mode = 'browse', region = null, plot = null, onPinClick, onPinHover, onGlobeClick, arcs = [], pulses = [] }: Props = $props();

	const globe = new GlobeState();
	const interaction = new GlobeInteraction(globe, () => ({ onPinClick, onPinHover, onGlobeClick }));
	let canvas: HTMLCanvasElement;
	let isDragging = $state(false);

	$effect(() => {
		interaction.attachTo(canvas);
		return startGlobeRenderLoop(canvas, (context, viewport, secondsElapsed) => {
			const now = Date.now();
			globe.advance(secondsElapsed, now);
			drawGlobeFrame(context, viewport, globe, { pins, mode, region, plot }, now);
		});
	});

	$effect(() => {
		globe.selectedPinId = selectedPinId;
		const selectedPin = untrack(() => pins).find((pin) => pin.id === selectedPinId);
		if (selectedPin) globe.flyTo(selectedPin);
	});

	$effect(() => {
		if (mode !== 'choose_plot' || !region) return;
		globe.flyTo(regionCentre(region), regionZoom(region));
	});

	$effect(() => {
		globe.arcs = arcs;
		globe.pulses = pulses;
	});

	export function flyTo(latitude: number, longitude: number, zoom?: number) {
		globe.flyTo({ latitude, longitude }, zoom);
	}

	export function flyToRandom() {
		globe.flyTo(randomDestination(pins));
	}

	function cursorFor() {
		if (isDragging) return 'cursor-grabbing';
		if (globe.hoveredPinId) return 'cursor-pointer';
		if (mode === 'choose_plot') return 'cursor-crosshair';
		return 'cursor-grab';
	}

	function afterPointer(handle: () => void) {
		handle();
		isDragging = interaction.isDragging;
	}
</script>

<div class="relative aspect-square w-full overflow-hidden rounded-2xl border border-carbon-700 bg-carbon-950 shadow-xl shadow-carbon-950/60 md:aspect-[16/10]">
	<canvas
		bind:this={canvas}
		class="absolute inset-0 h-full w-full touch-none select-none {cursorFor()}"
		aria-label="A globe of the world's carp waters"
		onpointerdown={(event) => afterPointer(() => interaction.pointerDown(event))}
		onpointermove={(event) => afterPointer(() => interaction.pointerMove(event))}
		onpointerup={(event) => afterPointer(() => interaction.pointerUp(event))}
		onpointercancel={(event) => afterPointer(() => interaction.pointerUp(event))}
		onpointerleave={() => interaction.pointerLeave()}
		onwheel={(event) => interaction.wheel(event)}
		ondblclick={(event) => interaction.doubleClick(event)}
	></canvas>
</div>
