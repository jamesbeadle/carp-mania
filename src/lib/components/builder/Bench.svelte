<script lang="ts">
	import type { Lake, Swim } from '$lib/domain/types';
	import type { BuilderState } from '$lib/game/builder/builderState.svelte';
	import DrawingControls from './DrawingControls.svelte';
	import NewSwimPanel from './NewSwimPanel.svelte';
	import SelectedSwimPanel from './SelectedSwimPanel.svelte';
	import ToolHint from './ToolHint.svelte';

	interface Props {
		builder: BuilderState;
		failures: string[];
		lake: Lake;
		swims: Swim[];
		onDetails: () => void;
	}

	let { builder, failures, lake, swims, onDetails }: Props = $props();

	const PlacedWords = 'Placed. The plan has the cost and the order button.';
	const selectedSwim = $derived(swims.find((swim) => swim.id === builder.selectedSwimId) ?? null);
	const isPlaced = $derived(builder.draft !== null && builder.phase === 'placed');
	const isNamingASwim = $derived(builder.tool === 'swim' && builder.swimPoint !== null);
	const isASwimChosen = $derived(builder.tool === 'select' && selectedSwim !== null);
	const hasSomethingOnTheBench = $derived(builder.isDrawing || isPlaced || isNamingASwim || isASwimChosen);
</script>

{#if hasSomethingOnTheBench}
	<div class="panel mt-2 py-3">
		{#if builder.isDrawing}
			<DrawingControls {builder} {failures} />
		{:else if isPlaced}
			<div class="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-4">
				<p class="min-w-0 text-sm leading-snug sm:flex-1" class:text-danger-400={failures.length > 0} class:text-mist-200={failures.length === 0}>{failures[0] ?? PlacedWords}</p>
				<div class="flex gap-2 sm:shrink-0">
					<button class="button-secondary px-3 text-base" onclick={() => builder.clear()}>Start again</button>
					<button class="button-primary px-3 text-base lg:hidden" onclick={onDetails}>The plan</button>
				</div>
			</div>
		{:else if isNamingASwim && builder.swimPoint}
			<NewSwimPanel {lake} {swims} point={builder.swimPoint} />
		{:else if isASwimChosen && selectedSwim}
			<SelectedSwimPanel {lake} {swims} swim={selectedSwim} movePoint={builder.swimPoint} />
		{/if}
	</div>
{:else}
	<ToolHint {builder} {onDetails} />
{/if}
