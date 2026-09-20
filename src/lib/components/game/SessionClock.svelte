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

<span class="font-display text-2xl leading-none font-extrabold italic tabular-nums sm:text-3xl" class:text-volt-400={!isMagicNow} class:text-surge-300={isMagicNow}>{formatFishingHour(hour)}</span>
<span class="short:hidden hidden w-32 sm:block">
	<span class="mb-1 flex justify-between font-display text-[10px] tracking-widest text-mist-400 uppercase"><span>{formatFishingHour(window.fromHour)}</span><span>{formatFishingHour(window.toHour)}</span></span>
	<span class="track relative block h-2 overflow-hidden rounded-full">
		<span class="absolute inset-0 flex">
			{#each marks as mark (mark)}<span class="h-full flex-1" class:is-magic={isAMagicHour(mark)}></span>{/each}
		</span>
		<span class="relative block h-full rounded-full bg-gradient-to-r from-volt-500 to-surge-500" style="width: {progress}%"></span>
	</span>
</span>
<span class="short:hidden hidden font-display text-sm tracking-wide uppercase sm:inline" class:text-surge-400={season.isWinter} class:text-mist-200={!season.isWinter}>{seasonLabel}</span>
<span class="font-display text-sm tracking-wide whitespace-nowrap text-mist-200 uppercase"><span class="text-volt-300">{landed}</span> landed · <span class="text-danger-400">{lost}</span> lost</span>

<style>
	.track {
		background: color-mix(in srgb, var(--color-mist-400) 28%, transparent);
	}
	.is-magic {
		background: color-mix(in srgb, var(--color-surge-500) 55%, transparent);
	}
</style>
