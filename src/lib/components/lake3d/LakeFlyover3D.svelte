<script lang="ts">
	import type { LayoutPoint } from '$lib/domain/layout/layoutTypes';
	import type { Carp, Lake, Swim } from '$lib/domain/types';
	import type { StageConditions } from '$lib/game/sky/stageConditions';
	import { LakeScene } from '$lib/game/lake3d/stage/lakeScene';
	import { lookingOverTheLake } from '$lib/game/lake3d/stage/sceneView';
	import { untrack } from 'svelte';
	import MeshBackdrop from '../brand/MeshBackdrop.svelte';

	interface Props {
		lake: Lake;
		swims: Swim[];
		carp: Carp[];
		conditions: StageConditions;
		showingAt?: LayoutPoint[];
		isDiorama?: boolean;
	}

	let { lake, swims, carp, conditions, showingAt = [], isDiorama = false }: Props = $props();

	const ZoomPerWheelStep = 1.1;
	const DioramaZoom = 1.3;

	let canvas: HTMLCanvasElement;
	let scene = $state<LakeScene | null>(null);
	let draggedFrom: { x: number; y: number } | null = null;

	$effect(() => {
		const fish = carp.map((one) => ({ strain: one.strain, weightLb: Number(one.weight_lb) }));
		const made = new LakeScene(canvas, untrack(() => ({ lake, swims, fish, conditions, isDiorama })), () => lookingOverTheLake(showingAt));
		if (isDiorama) made.rig.zoomBy(DioramaZoom);
		scene = made;
		return () => made.dispose();
	});

	$effect(() => scene?.setConditions(conditions));

	function drag(event: PointerEvent) {
		if (!draggedFrom) return;
		scene?.rig.look(event.clientX - draggedFrom.x, event.clientY - draggedFrom.y);
		draggedFrom = { x: event.clientX, y: event.clientY };
	}

	function zoom(event: WheelEvent) {
		event.preventDefault();
		scene?.rig.zoomBy(event.deltaY > 0 ? ZoomPerWheelStep : 1 / ZoomPerWheelStep);
	}
</script>

{#if isDiorama}<div class="absolute inset-0 bg-carbon-950"><MeshBackdrop opacity={0.4} rows={14} columns={30} /></div>{/if}
<canvas
	bind:this={canvas}
	class="absolute inset-0 block h-full w-full cursor-grab touch-none active:cursor-grabbing"
	onpointerdown={(event) => (draggedFrom = { x: event.clientX, y: event.clientY })}
	onpointermove={drag}
	onpointerup={() => (draggedFrom = null)}
	onpointercancel={() => (draggedFrom = null)}
	onwheel={zoom}
	aria-label="Your water in 3D — drag to fly around it"
></canvas>
