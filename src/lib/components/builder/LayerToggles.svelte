<script lang="ts">
	import { LayerLabels, LayerNames, type LayerVisibility } from '$lib/game/builder/layerVisibility';

	let { layers = $bindable() }: { layers: LayerVisibility } = $props();
</script>

<div class="mt-2 flex flex-wrap items-center gap-4 text-sm text-mist-400">
	<span class="stat-label">Layers</span>
	{#each LayerNames as layer (layer)}
		<label class="flex items-center gap-1.5">
			<input type="checkbox" bind:checked={layers[layer]} class="accent-volt-500" />
			{LayerLabels[layer]}
		</label>
	{/each}
</div>
