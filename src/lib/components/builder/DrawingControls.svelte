<script lang="ts">
	import type { BuilderState } from '$lib/game/builder/builderState.svelte';
	import { drawnShapeOf, finishDrawing, isPointsDraft, pointsStillNeeded, type PointsDraft } from '$lib/game/builder/finishDrawing';
	import { ruleBrokenWhileDrawing } from '$lib/game/builder/shapeWhileDrawing';
	import { pointerWords } from '$lib/game/stage/pointerWords';

	let { builder, failures }: { builder: BuilderState; failures: string[] } = $props();

	const FinishHints = {
		polygon: 'Click the ringed first point to close it, or double-click, press Enter or tap Finish.',
		polyline: 'Click the ringed last point again to finish, or double-click, press Enter or tap Finish.'
	} as const;

	const draft = $derived(builder.draft && isPointsDraft(builder.draft) ? builder.draft : null);
	const placedCount = $derived(draft?.points.length ?? 0);
	const canFinish = $derived(draft !== null && pointsStillNeeded(draft) === 0);
	const ruleBroken = $derived(builder.draft ? ruleBrokenWhileDrawing(builder.draft, failures) : null);
	const words = $derived(ruleBroken ?? pointerWords(guidanceFor(draft)));

	function guidanceFor(current: PointsDraft | null) {
		if (!current) return '';
		const stillNeeded = pointsStillNeeded(current);
		if (stillNeeded > 0) return `Click to place ${stillNeeded} more ${stillNeeded === 1 ? 'point' : 'points'}.`;
		return FinishHints[drawnShapeOf(current)];
	}
</script>

{#if draft}
	<div class="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-4">
		<p class="min-w-0 text-sm leading-snug sm:flex-1" class:text-danger-400={ruleBroken !== null} class:text-mist-200={ruleBroken === null}>
			<span class="font-display font-bold tracking-wide text-volt-300 uppercase">{placedCount} {placedCount === 1 ? 'point' : 'points'}</span> · {words}
		</p>
		<div class="flex flex-wrap gap-2 sm:shrink-0">
			<button class="button-secondary px-3 text-base" onclick={() => builder.undoLastPoint()}>Undo point</button>
			<button class="button-secondary px-3 text-base" onclick={() => builder.clear()}>Start again</button>
			<button class="button-primary px-3 text-base" disabled={!canFinish} onclick={() => finishDrawing(builder)}>Finish</button>
		</div>
	</div>
{/if}
