<script lang="ts">
	import type { LayoutPoint } from '$lib/domain/layout/layoutTypes';
	import { sampleOfShoals } from '$lib/domain/stock/shoalSample';
	import type { Shoal } from '$lib/domain/stock/shoals';
	import type { Carp, Lake, Swim } from '$lib/domain/types';
	import { createFishSchool } from '$lib/game/scene/fishSchool';
	import { CameraLimits, isZoomable } from '$lib/game/scene/camera';
	import { CameraGestures } from '$lib/game/scene/cameraInput';
	import { CameraState } from '$lib/game/scene/cameraState.svelte';
	import { clusterAt, clusterSwims } from '$lib/game/scene/clusterSwims';
	import { createSceneDrawer, isCastClearOfIslands, isPointInWater } from '$lib/game/scene/drawScene';
	import { distanceBetween, type Point } from '$lib/game/scene/lakeShape';
	import { SceneSize } from '$lib/game/scene/palette';
	import { startRenderLoop } from '$lib/game/scene/renderLoop';
	import type { RodOnBank } from '$lib/game/scene/rodState';
	import { SwimPegRadius, swimScenePoint } from '$lib/game/render/drawSwims';
	import type { DraftShape } from '$lib/game/render/drawUnderConstruction';
	import { untrack } from 'svelte';
	import Minimap from './stage/Minimap.svelte';

	interface Props {
		lake: Lake;
		swims: Swim[];
		carp: Carp[];
		shoals?: Shoal[];
		camera?: CameraState;
		selectedSwimId?: string | null;
		bountySwimId?: string | null;
		rods?: RodOnBank[];
		isAnglerOnBank?: boolean;
		drafts?: DraftShape[];
		showingAt?: LayoutPoint[];
		onSwimClick?: (swim: Swim) => void;
		onWaterClick?: (point: Point) => void;
		onBankClick?: (point: Point) => void;
		onCastBlockedByIsland?: () => void;
	}

	let { lake, swims, carp, shoals = [], camera = new CameraState(), selectedSwimId = null, bountySwimId = null, rods = [], isAnglerOnBank = false, drafts = [], showingAt = [], onSwimClick, onWaterClick, onBankClick, onCastBlockedByIsland }: Props = $props();

	const SchoolSeedStride = 7919;
	const SwimHitRadius = SwimPegRadius * 1.4;

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
			drawScene(context, { lake, swims, school, selectedSwimId, hoveredSwimId, rods, isAnglerOnBank, drafts, showingAt, pixelsPerScenePixel, bountySwimId }, secondsElapsed, timeSeconds);
		}, () => camera.camera);
	});

	const scenePointOf = (event: MouseEvent | PointerEvent) => camera.scenePointOf(canvas, event.clientX, event.clientY);
	const swimAt = (point: Point) => swims.find((swim) => distanceBetween(swimScenePoint(swim), point) <= SwimHitRadius);

	function handleMove(event: PointerEvent) {
		if (gestures.move(event)) return;
		hoveredSwimId = swimAt(scenePointOf(event))?.id ?? null;
	}

	function handleUp(event: PointerEvent) {
		if (gestures.up(event)) return;
		handleClick(scenePointOf(event));
	}

	function handleClick(point: Point) {
		const cluster = clusterAt(clusterSwims(swims, camera.pixelsPerScenePixel(canvas)), point, SwimHitRadius / camera.zoom);
		if (cluster) return camera.zoomAround(CameraLimits.ClickIntoClusterZoom, cluster.centre);
		const swim = swimAt(point);
		if (swim) return onSwimClick?.(swim);
		const context = canvas.getContext('2d');
		if (!context) return;
		if (!isPointInWater(context, lake.layout, point)) return onBankClick?.(point);
		const isBlocked = selectedSwim && !isCastClearOfIslands(context, lake.layout, swimScenePoint(selectedSwim), point);
		if (isBlocked) return onCastBlockedByIsland?.();
		onWaterClick?.(point);
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
