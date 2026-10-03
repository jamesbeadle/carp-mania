<script lang="ts">
	import { BrushSizeLabels, BrushSizes, type BrushSize } from '$lib/game/builder/brushSizes';
	import type { BuilderState } from '$lib/game/builder/builderState.svelte';

	let { builder }: { builder: BuilderState } = $props();

	const Sizes = Object.keys(BrushSizes) as BrushSize[];
</script>

<div class="space-y-1">
	<span class="stat-label">Brush</span>
	<div class="flex gap-1" role="radiogroup" aria-label="Brush size">
		{#each Sizes as size (size)}
			{@const isChosen = builder.brushScenePixels === BrushSizes[size]}
			<button type="button" role="radio" aria-checked={isChosen} class="flex-1 rounded-md border border-carbon-600 px-2 py-1 text-sm" class:bg-volt-500={isChosen} class:text-carbon-950={isChosen} onclick={() => (builder.brushScenePixels = BrushSizes[size])}>
				{BrushSizeLabels[size]}
			</button>
		{/each}
	</div>
</div>
