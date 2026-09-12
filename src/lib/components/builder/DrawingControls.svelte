<script lang="ts">
	import type { BuilderState } from '$lib/game/builder/builderState.svelte';
	import { drawnShapeOf, finishDrawing, isPointsDraft, pointsStillNeeded, type PointsDraft } from '$lib/game/builder/finishDrawing';

	let { builder }: { builder: BuilderState } = $props();

	const FinishHints = {
		polygon: 'Click the ringed first point to close it, or double-click, press Enter or tap Finish.',
		polyline: 'Click the ringed last point again to finish, or double-click, press Enter or tap Finish.'
	} as const;

	const draft = $derived(builder.draft && isPointsDraft(builder.draft) ? builder.draft : null);
	const placedCount = $derived(draft?.points.length ?? 0);
	const canFinish = $derived(draft !== null && pointsStillNeeded(draft) === 0);
	const guidance = $derived(guidanceFor(draft));

	function guidanceFor(current: PointsDraft | null) {
		if (!current) return '';
		const stillNeeded = pointsStillNeeded(current);
		if (stillNeeded > 0) return `Click to place ${stillNeeded} more ${stillNeeded === 1 ? 'point' : 'points'}.`;
		return FinishHints[drawnShapeOf(current)];
	}
</script>

{#if draft}
	<div class="space-y-2 border-t border-carbon-700 pt-3">
		<p class="text-sm text-mist-100">{placedCount} {placedCount === 1 ? 'point' : 'points'} placed</p>
		<p class="text-xs text-mist-400">{guidance}</p>
		<div class="flex gap-2">
			<button class="button-primary flex-1 px-2 text-base" disabled={!canFinish} onclick={() => finishDrawing(builder)}>Finish shape</button>
			<button class="button-secondary px-3 text-base" onclick={() => builder.undoLastPoint()}>Undo point</button>
		</div>
		<p class="text-xs text-mist-400">Backspace undoes the last point · Escape starts over</p>
	</div>
{/if}
