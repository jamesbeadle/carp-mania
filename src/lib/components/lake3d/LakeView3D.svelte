<script lang="ts">
	import type { LayoutPoint } from '$lib/domain/layout/layoutTypes';
	import { sampleOfShoals } from '$lib/domain/stock/shoalSample';
	import type { Shoal } from '$lib/domain/stock/shoals';
	import type { Carp, Lake, Swim } from '$lib/domain/types';
	import type { Point } from '$lib/game/scene/lakeShape';
	import type { CastReach } from '$lib/game/session/castReach';
	import type { SessionState } from '$lib/game/session/sessionState.svelte';
	import type { StageConditions } from '$lib/game/sky/stageConditions';
	import { CastControl, type CastRequest } from '$lib/game/lake3d/stage/castControl.svelte';
	import { LakeViewInput } from '$lib/game/lake3d/stage/lakeViewInput.svelte';
	import { SceneMount } from '$lib/game/lake3d/stage/sceneMount.svelte';
	import { sceneViewOf } from '$lib/game/lake3d/stage/sessionSceneView';
	import { scenePointOfWorld } from '$lib/game/lake3d/stage/swimSpots';
	import { untrack } from 'svelte';
	import CastHud from './CastHud.svelte';
	import WaterVeil from './WaterVeil.svelte';

	interface Props {
		session: SessionState;
		lake: Lake;
		swims: Swim[];
		carp: Carp[];
		shoals: Shoal[];
		conditions: StageConditions;
		showingAt: LayoutPoint[];
		castReach: CastReach | null;
		onSwimClick: (swim: Swim) => void;
		onWaterClick: (point: Point) => void;
		onCastBlocked: (problem: NonNullable<CastRequest['problem']>) => void;
	}

	let { session, lake, swims, carp, shoals, conditions, showingAt, castReach, onSwimClick, onWaterClick, onCastBlocked }: Props = $props();

	const MillisecondsPerSecond = 1000;

	let canvas: HTMLCanvasElement;
	const mount = new SceneMount();
	const cast = new CastControl(() => mount.scene, untrack(() => lake.layout), () => session.swim);
	const input = new LakeViewInput(() => mount.scene, () => canvas, cast, {
		reachFeetToCast: () => castReach?.reachFeet ?? null,
		onSwimPicked: (swimId) => {
			const swim = swims.find((candidate) => candidate.id === swimId);
			if (swim) onSwimClick(swim);
		},
		onCast: (request) => {
			if (request.problem) return onCastBlocked(request.problem);
			const { scene } = mount;
			if (scene) onWaterClick(scenePointOfWorld(scene.lakeFrame, request.landing));
		}
	});

	$effect(() => {
		const fish = [...carp, ...sampleOfShoals(shoals)].map((one) => ({ strain: one.strain, weightLb: Number(one.weight_lb) }));
		return mount.open(canvas, untrack(() => ({ lake, swims, fish, conditions })), () => sceneViewOf(session, input.hoveredSwimId, showingAt));
	});

	$effect(() => mount.scene?.setConditions(conditions));

	function keyDown(event: KeyboardEvent) {
		if (mount.hasDrawn) input.keyDown(event);
	}

	function keyUp(event: KeyboardEvent) {
		if (mount.hasDrawn) input.keyUp(event);
	}

	$effect(() => {
		let handle = 0;
		let last = performance.now();
		const frame = (now: number) => {
			input.tick((now - last) / MillisecondsPerSecond);
			last = now;
			handle = requestAnimationFrame(frame);
		};
		handle = requestAnimationFrame(frame);
		return () => cancelAnimationFrame(handle);
	});
</script>

<svelte:window onkeydown={keyDown} onkeyup={keyUp} />

<div class="absolute inset-0">
	<canvas
		bind:this={canvas}
		class="block h-full w-full touch-none"
		class:cursor-crosshair={castReach !== null}
		onpointerdown={(event) => input.down(event)}
		onpointermove={(event) => input.move(event)}
		onpointerup={(event) => input.up(event)}
		onpointercancel={() => cast.cancel()}
		onwheel={(event) => input.wheel(event)}
	></canvas>
	<CastHud {cast} isReady={castReach !== null} />
	{#if mount.isVeiled}<WaterVeil />{/if}
</div>
