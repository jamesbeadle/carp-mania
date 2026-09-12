<script lang="ts">
	import { createSkyScene, drawOverhead, drawSkyBackdrop } from '$lib/game/sky/drawSky';
	import { startSkyLoop } from '$lib/game/sky/skyLoop';
	import type { StageConditions } from '$lib/game/sky/stageConditions';

	let { conditions, layer }: { conditions: StageConditions; layer: 'backdrop' | 'overhead' } = $props();

	let canvas: HTMLCanvasElement;
	const scene = createSkyScene();
	const draw = layer === 'backdrop' ? drawSkyBackdrop : drawOverhead;

	$effect(() => startSkyLoop(canvas, (frame) => draw(frame, conditions, scene)));
</script>

<canvas bind:this={canvas} class="pointer-events-none absolute inset-0 h-full w-full" aria-hidden="true"></canvas>
