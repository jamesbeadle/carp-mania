<script lang="ts">
	import { FishingDay, FishingHoursPerDay, formatFishingHour } from '$lib/domain/fishing/sessionClock';

	let { hour, landed, lost }: { hour: number; landed: number; lost: number } = $props();

	const dayProgress = $derived(Math.min(100, ((hour - FishingDay.StartHour) / FishingHoursPerDay) * 100));
</script>

<div class="pointer-events-none absolute top-3 left-3 flex items-center gap-4 rounded-lg border border-carbon-700 bg-carbon-950/80 px-4 py-2 backdrop-blur">
	<span class="font-display text-3xl font-extrabold text-volt-400 italic tabular-nums">{formatFishingHour(hour)}</span>
	<div class="w-28">
		<div class="mb-1 flex justify-between font-display text-[10px] tracking-widest text-mist-400 uppercase"><span>Dawn</span><span>Dusk</span></div>
		<div class="h-1.5 overflow-hidden rounded-full bg-carbon-700"><div class="h-full bg-gradient-to-r from-volt-500 to-surge-500" style="width: {dayProgress}%"></div></div>
	</div>
	<span class="font-display text-sm tracking-wide text-mist-200 uppercase"><span class="text-volt-300">{landed}</span> landed · <span class="text-danger-400">{lost}</span> lost</span>
</div>
