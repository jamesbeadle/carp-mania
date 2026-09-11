<script lang="ts">
	import type { ViewMode } from '$lib/game/scene/camera';

	let { viewMode = $bindable<ViewMode>('birdseye'), hasSwim }: { viewMode?: ViewMode; hasSwim: boolean } = $props();

	const toggle = () => (viewMode = viewMode === 'birdseye' ? 'swim' : 'birdseye');

	function toggleOnKey(event: KeyboardEvent) {
		if (event.key.toLowerCase() !== 'v' || !hasSwim) return;
		toggle();
	}
</script>

<svelte:window onkeydown={toggleOnKey} />

<div class="absolute top-3 right-3 flex overflow-hidden rounded-lg border border-carbon-700 bg-carbon-950/85 font-display text-sm font-bold tracking-wide uppercase backdrop-blur">
	<button class="px-3 py-1.5" class:bg-volt-500={viewMode === 'birdseye'} class:text-carbon-950={viewMode === 'birdseye'} class:text-mist-200={viewMode !== 'birdseye'} onclick={() => (viewMode = 'birdseye')}>Bird's-eye</button>
	<button class="px-3 py-1.5 disabled:opacity-40" class:bg-volt-500={viewMode === 'swim'} class:text-carbon-950={viewMode === 'swim'} class:text-mist-200={viewMode !== 'swim'} disabled={!hasSwim} onclick={() => (viewMode = 'swim')}>Swim view</button>
</div>
