<script lang="ts">
	import type { CarpStrain } from '$lib/domain/types';
	import { drawCarpPortrait } from '$lib/game/render/drawCarpPortrait';

	let { strain, weightLb }: { strain: CarpStrain; weightLb: number } = $props();

	let canvas: HTMLCanvasElement;
	const PortraitSize = { Width: 520, Height: 320 } as const;

	$effect(() => {
		const context = canvas.getContext('2d');
		if (!context) return;
		let handle = 0;
		const start = performance.now();
		const frame = (now: number) => {
			drawCarpPortrait(context, strain, weightLb, PortraitSize.Width, PortraitSize.Height, (now - start) / 1000);
			handle = requestAnimationFrame(frame);
		};
		handle = requestAnimationFrame(frame);
		return () => cancelAnimationFrame(handle);
	});
</script>

<canvas bind:this={canvas} width={PortraitSize.Width} height={PortraitSize.Height} class="w-full rounded-xl border-4 border-mist-100"></canvas>
