<script lang="ts">
	import type { LayoutPoint } from '$lib/domain/layout/layoutTypes';
	import type { Carp, Lake, Swim } from '$lib/domain/types';
	import type { StageConditions } from '$lib/game/sky/stageConditions';
	import type { LakeScene } from '$lib/game/lake3d/stage/lakeScene';
	import { SceneMount } from '$lib/game/lake3d/stage/sceneMount.svelte';
	import { lookingOverTheLake } from '$lib/game/lake3d/stage/sceneView';
	import { untrack } from 'svelte';
	import MeshBackdrop from '../brand/MeshBackdrop.svelte';
	import WaterVeil from './WaterVeil.svelte';

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
	const mount = new SceneMount();
	let draggedFrom: { x: number; y: number } | null = null;

	$effect(() => {
		const fish = carp.map((one) => ({ strain: one.strain, weightLb: Number(one.weight_lb) }));
		const zoomTheDiorama = (made: LakeScene) => void (isDiorama && made.rig.zoomBy(DioramaZoom));
		return mount.open(canvas, untrack(() => ({ lake, swims, fish, conditions, isDiorama })), () => lookingOverTheLake(showingAt), zoomTheDiorama);
	});

	$effect(() => mount.scene?.setConditions(conditions));

	function drag(event: PointerEvent) {
		if (!draggedFrom) return;
		mount.scene?.rig.look(event.clientX - draggedFrom.x, event.clientY - draggedFrom.y);
		draggedFrom = { x: event.clientX, y: event.clientY };
	}

	function zoom(event: WheelEvent) {
		event.preventDefault();
		mount.scene?.rig.zoomBy(event.deltaY > 0 ? ZoomPerWheelStep : 1 / ZoomPerWheelStep);
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
{#if mount.isVeiled}<WaterVeil />{/if}
