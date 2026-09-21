<script lang="ts">
	import type { LayoutPoint } from '$lib/domain/layout/layoutTypes';
	import { sampleOfShoals } from '$lib/domain/stock/shoalSample';
	import type { Shoal } from '$lib/domain/stock/shoals';
	import type { Carp, Lake, Swim } from '$lib/domain/types';
	import { createFishSchool } from '$lib/game/scene/fishSchool';
	import { CameraLimits, isZoomable } from '$lib/game/scene/camera';
	import { CameraGestures } from '$lib/game/scene/cameraInput';
	import { CameraState } from '$lib/game/scene/cameraState.svelte';
	import { createSceneDrawer } from '$lib/game/scene/drawScene';
	import type { Point } from '$lib/game/scene/lakeShape';
	import { SceneSize } from '$lib/game/scene/palette';
	import { startRenderLoop } from '$lib/game/scene/renderLoop';
	import type { RodOnBank } from '$lib/game/scene/rodState';
	import { answerTheClick, swimAt } from '$lib/game/scene/waterClicks';
	import type { DraftShape } from '$lib/game/render/drawUnderConstruction';
	import type { CastReach } from '$lib/game/session/castReach';
	import { untrack } from 'svelte';
	import Minimap from './stage/Minimap.svelte';

	interface Props {
		lake: Lake;
		swims: Swim[];
		carp: Carp[];
		shoals?: Shoal[];
		camera?: CameraState;
		selectedSwimId?: string | null;
		castReach?: CastReach | null;
		rods?: RodOnBank[];
		isAnglerOnBank?: boolean;
		drafts?: DraftShape[];
		showingAt?: LayoutPoint[];
		onSwimClick?: (swim: Swim) => void;
		onWaterClick?: (point: Point) => void;
		onBankClick?: (point: Point) => void;
		onCastBlockedByIsland?: () => void;
	}

	let { lake, swims, carp, shoals = [], camera = new CameraState(), selectedSwimId = null, castReach = null, rods = [], isAnglerOnBank = false, drafts = [], showingAt = [], onSwimClick, onWaterClick, onBankClick, onCastBlockedByIsland }: Props = $props();

	const SchoolSeedStride = 7919;

	let canvas: HTMLCanvasElement;
	let hoveredSwimId = $state<string | null>(null);
	const gestures = new CameraGestures(untrack(() => camera), () => canvas);
	const selectedSwim = $derived(swims.find((candidate) => candidate.id === selectedSwimId) ?? null);
	const hasMinimap = $derived(isZoomable(Number(lake.plot_acres)) || camera.zoom > CameraLimits.LeastZoom);

	$effect(() => {
		const layout = lake.layout;
		const school = createFishSchool([...carp, ...sampleOfShoals(shoals)], lake.pike_count, lake.id.length * SchoolSeedStride, layout);
		const drawScene = createSceneDrawer(layout);
		return startRenderLoop(canvas, (context, secondsElapsed, timeSeconds) => {
			const pixelsPerScenePixel = camera.pixelsPerScenePixel(canvas);
			drawScene(context, { lake, swims, school, selectedSwimId, hoveredSwimId, rods, isAnglerOnBank, drafts, showingAt, pixelsPerScenePixel, castReach }, secondsElapsed, timeSeconds);
		}, () => camera.camera);
	});

	const scenePointOf = (event: MouseEvent | PointerEvent) => camera.scenePointOf(canvas, event.clientX, event.clientY);

	function handleMove(event: PointerEvent) {
		if (gestures.move(event)) return;
		hoveredSwimId = swimAt(swims, scenePointOf(event))?.id ?? null;
	}

	function handleUp(event: PointerEvent) {
		if (gestures.up(event)) return;
		answerTheClick({ lake, swims, selectedSwim, camera, canvas }, scenePointOf(event), { onSwimClick, onWaterClick, onBankClick, onCastBlockedByIsland });
	}
</script>

<div class="relative">
	<canvas
		bind:this={canvas}
		class="aspect-[3/2] w-full cursor-pointer touch-none rounded-2xl border border-carbon-700 shadow-xl shadow-carbon-950/60"
		width={SceneSize.Width}
		height={SceneSize.Height}
		onwheel={(event) => gestures.wheel(event)}
		onpointerdown={(event) => gestures.down(event)}
		onpointermove={handleMove}
		onpointerup={handleUp}
		onpointercancel={(event) => gestures.up(event)}
	></canvas>
	{#if hasMinimap}<Minimap layout={lake.layout} {camera} />{/if}
</div>
