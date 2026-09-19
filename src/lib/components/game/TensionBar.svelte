<script lang="ts">
	import type { Band } from '$lib/domain/fishing/fight';

	let { tension, band }: { tension: number; band: Band } = $props();

	const PercentScale = 100;
	const MarkerHalfWidthPixels = 3;
</script>

<div class="relative h-8 overflow-hidden rounded-full bg-carbon-950">
	<div class="absolute inset-y-0 bg-gradient-to-r from-volt-500/50 via-surge-500/40 to-volt-500/50" style="left: {band.slackBelow * PercentScale}%; width: {(band.snapAbove - band.slackBelow) * PercentScale}%"></div>
	<div class="absolute inset-y-0 w-1.5 rounded-full bg-volt-300 transition-[left] duration-75" style="left: calc({tension * PercentScale}% - {MarkerHalfWidthPixels}px)"></div>
</div>
<div class="flex justify-between text-xs text-mist-400"><span>Slack — hook falls out</span><span>Tight — line snaps</span></div>
