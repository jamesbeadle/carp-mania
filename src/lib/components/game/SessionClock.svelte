<script lang="ts">
	import { isAMagicHour } from '$lib/domain/fishing/magicHours';
	import { formatFishingHour } from '$lib/domain/fishing/sessionClock';
	import { hoursInWindow, windowProgress, type SessionWindow } from '$lib/domain/fishing/sessionWindow';
	import type { Season } from '$lib/domain/world/seasons';
	import { humanise } from '$lib/format/labels';

	interface Props {
		hour: number;
		window: SessionWindow;
		season: Season;
		landed: number;
		lost: number;
	}

	let { hour, window, season, landed, lost }: Props = $props();

	const progress = $derived(windowProgress(hour, window) * 100);
	const seasonLabel = $derived(season.isWinter ? 'Winter · fish deep' : humanise(season.name));
	const marks = $derived(Array.from({ length: hoursInWindow(window) }, (_, offset) => window.fromHour + offset));
	const isMagicNow = $derived(isAMagicHour(hour));
</script>

<div class="pointer-events-none inline-flex items-center gap-3 rounded-lg border border-carbon-700 bg-carbon-950/80 px-3 py-1.5 backdrop-blur sm:gap-4 sm:px-4 sm:py-2">
	<span class="font-display text-2xl font-extrabold italic tabular-nums sm:text-3xl" class:text-volt-400={!isMagicNow} class:text-surge-300={isMagicNow}>{formatFishingHour(hour)}</span>
	<div class="short:hidden hidden w-32 sm:block">
		<div class="mb-1 flex justify-between font-display text-[10px] tracking-widest text-mist-400 uppercase"><span>{formatFishingHour(window.fromHour)}</span><span>{formatFishingHour(window.toHour)}</span></div>
		<div class="relative h-1.5 overflow-hidden rounded-full bg-carbon-700">
			<div class="absolute inset-0 flex">
				{#each marks as mark (mark)}<span class="h-full flex-1" class:is-magic={isAMagicHour(mark)}></span>{/each}
			</div>
			<div class="relative h-full bg-gradient-to-r from-volt-500 to-surge-500" style="width: {progress}%"></div>
		</div>
	</div>
	<span class="short:hidden hidden font-display text-sm tracking-wide uppercase sm:inline" class:text-surge-400={season.isWinter} class:text-mist-200={!season.isWinter}>{seasonLabel}</span>
	<span class="font-display text-sm tracking-wide text-mist-200 uppercase"><span class="text-volt-300">{landed}</span> landed · <span class="text-danger-400">{lost}</span> lost</span>
</div>

<style>
	.is-magic {
		background: color-mix(in srgb, var(--color-surge-500) 30%, transparent);
	}
</style>
