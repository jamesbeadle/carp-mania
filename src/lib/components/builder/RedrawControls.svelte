<script lang="ts">
	import type { BuilderState } from '$lib/game/builder/builderState.svelte';
	import { pointerWords } from '$lib/game/stage/pointerWords';

	let { builder }: { builder: BuilderState } = $props();

	const placedCount = $derived(builder.bankPath.length);
	const guidance = $derived(placedCount === 0 ? 'Click along the new bank, or click the shoreline straight away for a smooth curve between the two points.' : 'Click the shoreline again to finish the new bank.');
	const words = $derived(builder.notice ?? pointerWords(guidance));
</script>

<div class="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-4">
	<p class="min-w-0 text-sm leading-snug sm:flex-1" class:text-danger-400={builder.notice !== null} class:text-mist-200={builder.notice === null}>
		<span class="font-display font-bold tracking-wide text-volt-300 uppercase">{placedCount} {placedCount === 1 ? 'point' : 'points'}</span> · {words}
	</p>
	<div class="flex flex-wrap gap-2 sm:shrink-0">
		<button class="button-secondary px-3 text-base" onclick={() => builder.undoLastPoint()}>Undo point</button>
		<button class="button-secondary px-3 text-base" onclick={() => builder.clear()}>Start again</button>
	</div>
</div>
