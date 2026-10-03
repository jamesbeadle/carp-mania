<script lang="ts">
	import type { LayoutPoint } from '$lib/domain/layout/layoutTypes';
	import type { Carp, Lake, Swim } from '$lib/domain/types';
	import { createPointerGestures } from '$lib/game/builder/builderInput';
	import type { BuilderState } from '$lib/game/builder/builderState.svelte';
	import { finishDrawing } from '$lib/game/builder/finishDrawing';
	import { createSiteFocus } from '$lib/game/builder/placement/siteFocus';
	import { toolHandlersFor } from '$lib/game/builder/tools/toolFor';
	import type { ToolContext, ToolHandlers } from '$lib/game/builder/tools/toolHandlers';
	import type { DraftShape } from '$lib/game/render/drawUnderConstruction';
	import { CameraState } from '$lib/game/scene/cameraState.svelte';
	import { toFraction } from '$lib/game/scene/lakeShape';
	import LakeCanvas from '../LakeCanvas.svelte';

	interface Props {
		builder: BuilderState;
		lake: Lake;
		sceneLake: Lake;
		swims: Swim[];
		sceneSwims: Swim[];
		carp: Carp[];
		drafts: DraftShape[];
	}

	let { builder, lake, sceneLake, swims, sceneSwims, carp, drafts }: Props = $props();

	let wrapper: HTMLDivElement;
	const camera = new CameraState();
	const focusOnANewSite = createSiteFocus(camera);

	$effect(() => focusOnANewSite(builder, lake, swims));
	$effect(() => {
		const draft = builder.draft;
		if (!builder.isPointerDown) builder.history.record(draft);
	});

	const contextNow = (): ToolContext => ({ layout: lake.layout, plotAcres: Number(lake.plot_acres), swims });
	const act = (gesture: keyof ToolHandlers) => (point: LayoutPoint) => toolHandlersFor(builder.tool)[gesture]?.(builder, point, contextNow());
	const gestures = createPointerGestures({
		onHover: (point) => (builder.hover = point),
		onClick: act('onClick'),
		onDoubleClick: act('onDoubleClick'),
		onDragStart: act('onDragStart'),
		onDrag: act('onDrag'),
		onDragEnd: act('onDragEnd')
	});

	function pointOf(event: PointerEvent): LayoutPoint {
		const canvas = wrapper.querySelector('canvas');
		if (!canvas) return { x: 0, y: 0 };
		return toFraction(camera.scenePointOf(canvas, event.clientX, event.clientY));
	}

	function letGo() {
		gestures.leave();
		builder.isPointerDown = false;
	}

	function handleKey(event: KeyboardEvent) {
		const isTyping = event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement;
		if (isTyping) return;
		const isCommand = event.ctrlKey || event.metaKey;
		if (isCommand && event.key.toLowerCase() === 'z') return event.shiftKey ? builder.redo() : builder.undo();
		if (isCommand && event.key.toLowerCase() === 'y') return builder.redo();
		if (event.key === 'Escape') builder.clear();
		if (event.key === 'Backspace') builder.undoLastPoint();
		if (event.key === 'Enter') finishDrawing(builder);
	}
</script>

<svelte:window onkeydown={handleKey} />

<div
	bind:this={wrapper}
	class="touch-none select-none"
	role="presentation"
	onpointerdown={(event) => {
		event.preventDefault();
		event.currentTarget.setPointerCapture(event.pointerId);
		builder.isPointerDown = true;
		gestures.down(pointOf(event));
	}}
	onpointermove={(event) => gestures.move(pointOf(event))}
	onpointerup={(event) => {
		gestures.up(pointOf(event));
		builder.isPointerDown = false;
	}}
	onpointercancel={() => letGo()}
	onpointerleave={() => letGo()}
	oncontextmenu={(event) => event.preventDefault()}
>
	<LakeCanvas lake={sceneLake} swims={sceneSwims} {carp} {drafts} {camera} selectedSwimId={builder.selectedSwimId} />
</div>
