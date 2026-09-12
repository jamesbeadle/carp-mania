<script lang="ts">
	import { FishingDay, FishingHoursPerDay, formatFishingHour } from '$lib/domain/fishing/sessionClock';
	import type { Season } from '$lib/domain/world/seasons';
	import { humanise } from '$lib/format/labels';

	let { hour, season, landed, lost }: { hour: number; season: Season; landed: number; lost: number } = $props();

	const dayProgress = $derived(Math.min(100, ((hour - FishingDay.StartHour) / FishingHoursPerDay) * 100));
	const seasonLabel = $derived(season.isWinter ? 'Winter · fish deep' : humanise(season.name));
</script>

<div class="pointer-events-none inline-flex items-center gap-3 rounded-lg border border-carbon-700 bg-carbon-950/80 px-3 py-1.5 backdrop-blur sm:gap-4 sm:px-4 sm:py-2">
	<span class="font-display text-2xl font-extrabold text-volt-400 italic tabular-nums sm:text-3xl">{formatFishingHour(hour)}</span>
	<div class="short:hidden hidden w-28 sm:block">
		<div class="mb-1 flex justify-between font-display text-[10px] tracking-widest text-mist-400 uppercase"><span>Dawn</span><span>Dusk</span></div>
		<div class="h-1.5 overflow-hidden rounded-full bg-carbon-700"><div class="h-full bg-gradient-to-r from-volt-500 to-surge-500" style="width: {dayProgress}%"></div></div>
	</div>
	<span class="short:hidden hidden font-display text-sm tracking-wide uppercase sm:inline" class:text-surge-400={season.isWinter} class:text-mist-200={!season.isWinter}>{seasonLabel}</span>
	<span class="font-display text-sm tracking-wide text-mist-200 uppercase"><span class="text-volt-300">{landed}</span> landed · <span class="text-danger-400">{lost}</span> lost</span>
</div>
