<script lang="ts">
	import type { LakeLayout } from '$lib/domain/layout/layoutTypes';
	import { viewportOf } from '$lib/game/scene/camera';
	import type { CameraState } from '$lib/game/scene/cameraState.svelte';
	import { SceneSize } from '$lib/game/scene/palette';

	let { layout, camera }: { layout: LakeLayout; camera: CameraState } = $props();

	const MapSize = { Width: 120, Height: 80 } as const;
	const outline = $derived(layout.outline.map(mapPointWords).join(' '));
	const viewport = $derived(viewportOf(camera.camera));
	const scaleX = MapSize.Width / SceneSize.Width;
	const scaleY = MapSize.Height / SceneSize.Height;
	const box = $derived(scaledBox(viewport));

	const ZoomStep = 1.5;
	const viewBox = `0 0 ${MapSize.Width} ${MapSize.Height}`;

	function mapPointWords(point: { x: number; y: number }) {
		const x = point.x * MapSize.Width;
		const y = point.y * MapSize.Height;
		return `${x},${y}`;
	}

	function scaledBox(view: { x: number; y: number; width: number; height: number }) {
		const { x, y, width, height } = view;
		return { x: x * scaleX, y: y * scaleY, width: width * scaleX, height: height * scaleY };
	}
	const zoomBy = (factor: number) => camera.zoomAround(factor, camera.camera.centre);

	function jumpTo(event: MouseEvent) {
		const bounds = (event.currentTarget as SVGSVGElement).getBoundingClientRect();
		const across = (event.clientX - bounds.left) / bounds.width;
		const down = (event.clientY - bounds.top) / bounds.height;
		const x = across * SceneSize.Width;
		const y = down * SceneSize.Height;
		camera.centreOn({ x, y });
	}
</script>

<div class="absolute right-3 bottom-3 flex flex-col items-end gap-1">
	<svg viewBox={viewBox} class="h-20 w-[120px] rounded-lg border border-carbon-700 bg-carbon-950/80 backdrop-blur" role="button" tabindex="0" aria-label="Minimap — click to move the view" onclick={jumpTo} onkeydown={(event) => event.key === 'Enter' && camera.reset()}>
		<polygon points={outline} fill="hsl(200 40% 30%)" stroke="hsl(200 30% 55%)" stroke-width="1" />
		<rect {...box} fill="none" stroke="hsl(72 90% 60%)" stroke-width="1.5" />
	</svg>
	<div class="flex gap-1">
		<button class="rounded bg-carbon-950/80 px-2 text-xs text-mist-200" onclick={() => zoomBy(1 / ZoomStep)} aria-label="Zoom out">−</button>
		<button class="rounded bg-carbon-950/80 px-2 text-xs text-mist-200" onclick={() => camera.reset()} aria-label="Fit the water">fit</button>
		<button class="rounded bg-carbon-950/80 px-2 text-xs text-mist-200" onclick={() => zoomBy(ZoomStep)} aria-label="Zoom in">+</button>
	</div>
</div>
