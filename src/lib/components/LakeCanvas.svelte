<script lang="ts">
	import type { LayoutPoint } from '$lib/domain/layout/layoutTypes';
	import type { Carp, Lake, Swim } from '$lib/domain/types';
	import { createFishSchool } from '$lib/game/scene/fishSchool';
	import { createSceneDrawer, isCastClearOfIslands, isPointInWater } from '$lib/game/scene/drawScene';
	import type { Point } from '$lib/game/scene/lakeShape';
	import { SceneSize } from '$lib/game/scene/palette';
	import { startRenderLoop, toScenePoint } from '$lib/game/scene/renderLoop';
	import type { RodOnBank } from '$lib/game/scene/rodState';
	import { SwimPegRadius, swimScenePoint } from '$lib/game/render/drawSwims';
	import type { DraftShape } from '$lib/game/render/drawUnderConstruction';

	interface Props {
		lake: Lake;
		swims: Swim[];
		carp: Carp[];
		selectedSwimId?: string | null;
		rods?: RodOnBank[];
		isAnglerOnBank?: boolean;
		drafts?: DraftShape[];
		showingAt?: LayoutPoint[];
		onSwimClick?: (swim: Swim) => void;
		onWaterClick?: (point: Point) => void;
		onBankClick?: (point: Point) => void;
		onCastBlockedByIsland?: () => void;
	}

	let { lake, swims, carp, selectedSwimId = null, rods = [], isAnglerOnBank = false, drafts = [], showingAt = [], onSwimClick, onWaterClick, onBankClick, onCastBlockedByIsland }: Props = $props();

	const SchoolSeedStride = 7919;
	const SwimHitRadius = SwimPegRadius * 1.4;

	let canvas: HTMLCanvasElement;
	let hoveredSwimId = $state<string | null>(null);

	const selectedSwim = $derived(swims.find((candidate) => candidate.id === selectedSwimId) ?? null);

	$effect(() => {
		const layout = lake.layout;
		const school = createFishSchool(carp, lake.pike_count, lake.id.length * SchoolSeedStride, layout);
		const drawScene = createSceneDrawer(layout);
		return startRenderLoop(canvas, (context, secondsElapsed, timeSeconds) => {
			drawScene(context, { lake, swims, school, selectedSwimId, hoveredSwimId, rods, isAnglerOnBank, drafts, showingAt }, secondsElapsed, timeSeconds);
		});
	});

	const scenePointOf = (event: MouseEvent) => toScenePoint(canvas, event.clientX, event.clientY);
	const swimAt = (point: Point) => swims.find((swim) => distance(swimScenePoint(swim), point) <= SwimHitRadius);
	const distance = (first: Point, second: Point) => Math.hypot(first.x - second.x, first.y - second.y);

	function handleMove(event: MouseEvent) {
		hoveredSwimId = swimAt(scenePointOf(event))?.id ?? null;
	}

	function handleClick(event: MouseEvent) {
		const point = scenePointOf(event);
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

<canvas
	bind:this={canvas}
	class="aspect-[3/2] w-full cursor-pointer rounded-2xl border border-carbon-700 shadow-xl shadow-carbon-950/60"
	width={SceneSize.Width}
	height={SceneSize.Height}
	onmousemove={handleMove}
	onclick={handleClick}
></canvas>
