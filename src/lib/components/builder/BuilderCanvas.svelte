<script lang="ts">
	import type { LayoutPoint } from '$lib/domain/layout/layoutTypes';
	import type { Carp, Lake, Swim } from '$lib/domain/types';
	import { createPointerGestures } from '$lib/game/builder/builderInput';
	import type { BuilderState } from '$lib/game/builder/builderState.svelte';
	import { finishDrawing } from '$lib/game/builder/finishDrawing';
	import { toolHandlersFor } from '$lib/game/builder/tools/toolFor';
	import type { ToolContext, ToolHandlers } from '$lib/game/builder/tools/toolHandlers';
	import type { DraftShape } from '$lib/game/render/drawUnderConstruction';
	import { toFraction } from '$lib/game/scene/lakeShape';
	import { toScenePoint } from '$lib/game/scene/renderLoop';
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

	function pointOf(event: MouseEvent): LayoutPoint {
		const canvas = wrapper.querySelector('canvas');
		if (!canvas) return { x: 0, y: 0 };
		return toFraction(toScenePoint(canvas, event.clientX, event.clientY));
	}

	function handleKey(event: KeyboardEvent) {
		const isTyping = event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement;
		if (isTyping) return;
		if (event.key === 'Escape') builder.clear();
		if (event.key === 'Backspace') builder.undoLastPoint();
		if (event.key === 'Enter') finishDrawing(builder);
	}
</script>

<svelte:window onkeydown={handleKey} />

<div
	bind:this={wrapper}
	class="select-none"
	role="presentation"
	onmousedown={(event) => {
		event.preventDefault();
		gestures.down(pointOf(event));
	}}
	onmousemove={(event) => gestures.move(pointOf(event))}
	onmouseup={(event) => gestures.up(pointOf(event), event.detail)}
	onmouseleave={() => gestures.leave()}
	ondblclick={(event) => gestures.doubleClick(pointOf(event))}
>
	<LakeCanvas lake={sceneLake} swims={sceneSwims} {carp} {drafts} selectedSwimId={builder.selectedSwimId} />
</div>
