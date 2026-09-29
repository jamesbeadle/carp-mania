<script lang="ts">
	import type { Band } from '$lib/domain/fishing/fight';

	let { tension, band }: { tension: number; band: Band } = $props();

	const PercentScale = 100;
	const MarkerHalfWidthPixels = 4;
	const EdgeFade = 0.06;
	const stops = $derived(bandStops(band));
	const isOutsideBand = $derived(tension < band.slackBelow || tension > band.snapAbove);

	function bandStops({ slackBelow, snapAbove }: Band) {
		const percent = (share: number) => `${Math.round(Math.min(1, Math.max(0, share)) * PercentScale)}%`;
		return `var(--color-danger-500) 0%, var(--color-warning-500) ${percent(slackBelow)}, var(--color-volt-600) ${percent(slackBelow + EdgeFade)}, var(--color-volt-600) ${percent(snapAbove - EdgeFade)}, var(--color-warning-500) ${percent(snapAbove)}, var(--color-danger-500) 100%`;
	}
</script>

<div class="tension relative mt-2 h-4 rounded-full" style="background: linear-gradient(90deg, {stops})">
	<div class="absolute -inset-y-1 w-2 rounded-full shadow-lg" class:bg-mist-100={!isOutsideBand} class:bg-danger-400={isOutsideBand} style="left: calc({tension * PercentScale}% - {MarkerHalfWidthPixels}px)"></div>
</div>

<style>
	.tension {
		box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.5);
		opacity: 0.92;
	}
</style>
