<script lang="ts">
	import type { Carp, Lake, Swim } from '$lib/domain/types';
	import { createFishSchool } from '$lib/game/scene/fishSchool';
	import { createSceneDrawer, isPointInWater } from '$lib/game/scene/drawScene';
	import type { Point } from '$lib/game/scene/lakeShape';
	import { SceneSize } from '$lib/game/scene/palette';
	import { startRenderLoop, toScenePoint } from '$lib/game/scene/renderLoop';
	import type { RodOnBank } from '$lib/game/scene/rodState';
	import { SwimPegRadius, swimScenePoint } from '$lib/game/render/drawSwims';

	interface Props {
		lake: Lake;
		swims: Swim[];
		carp: Carp[];
		selectedSwimId?: string | null;
		rods?: RodOnBank[];
		isAnglerOnBank?: boolean;
		onSwimClick?: (swim: Swim) => void;
		onWaterClick?: (point: Point) => void;
	}

	let { lake, swims, carp, selectedSwimId = null, rods = [], isAnglerOnBank = false, onSwimClick, onWaterClick }: Props = $props();

	let canvas: HTMLCanvasElement;
	let hoveredSwimId = $state<string | null>(null);
	const school = createFishSchool(carp, lake.pike_count, lake.id.length * 7919);
	const drawScene = createSceneDrawer();

	$effect(() =>
		startRenderLoop(canvas, (context, secondsElapsed, timeSeconds) =>
			drawScene(context, { lake, swims, school, selectedSwimId, hoveredSwimId, rods, isAnglerOnBank }, secondsElapsed, timeSeconds)
		)
	);

	const swimAt = (point: Point) => swims.find((swim) => distance(swimScenePoint(swim), point) <= SwimPegRadius * 1.4);
	const distance = (first: Point, second: Point) => Math.hypot(first.x - second.x, first.y - second.y);

	function handleMove(event: MouseEvent) {
		hoveredSwimId = swimAt(toScenePoint(canvas, event.clientX, event.clientY))?.id ?? null;
	}

	function handleClick(event: MouseEvent) {
		const point = toScenePoint(canvas, event.clientX, event.clientY);
		const swim = swimAt(point);
		if (swim) return onSwimClick?.(swim);
		const context = canvas.getContext('2d');
		if (context && isPointInWater(context, point.x, point.y)) onWaterClick?.(point);
	}
</script>

<canvas
	bind:this={canvas}
	class="aspect-[3/2] w-full cursor-pointer rounded-2xl border border-pond-700 shadow-xl shadow-pond-950/60"
	width={SceneSize.Width}
	height={SceneSize.Height}
	onmousemove={handleMove}
	onclick={handleClick}
></canvas>
