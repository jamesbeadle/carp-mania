<script lang="ts">
	import { streakBiteFactor, streakWords } from '$lib/domain/fishing/streak';
	import { weatherWords } from '$lib/domain/fishing/weatherConditions';
	import type { Carp, Lake } from '$lib/domain/types';
	import { weatherFor } from '$lib/domain/world/weather';
	import { formatMoney } from '$lib/format/money';
	import { formatWeight } from '$lib/format/weight';
	import StatRow from '../stats/StatRow.svelte';

	interface Props {
		lake: Lake;
		carp: Carp[];
		knownCarpCount: number;
		money: number;
		streakIfFishedToday: number;
	}

	let { lake, carp, knownCarpCount, money, streakIfFishedToday }: Props = $props();

	const NoFishYet = '—';
	const known = $derived(carp.filter((fish) => fish.is_catalogued));
	const heaviestLb = $derived(known.reduce((best, fish) => Math.max(best, Number(fish.weight_lb)), 0));
	const todaysWeather = $derived(weatherWords(weatherFor(lake, new Date())));
	const stats = $derived([
		{ label: 'Reputation', value: String(Math.round(Number(lake.reputation))), tone: 'volt' as const },
		{ label: 'In the book', value: String(knownCarpCount), caption: 'carp' },
		{ label: 'Biggest known', value: heaviestLb > 0 ? formatWeight(heaviestLb) : NoFishYet },
		{ label: 'Your purse', value: formatMoney(money) },
		{ label: 'Streak', value: `Day ${streakIfFishedToday}`, caption: `bites ×${streakBiteFactor(streakIfFishedToday).toFixed(1)}`, tone: 'volt' as const }
	]);
</script>

<StatRow {stats} />
<p class="mt-3 flex flex-wrap items-baseline gap-x-2 text-xs text-mist-400"><span class="stat-label">Today</span><span>{todaysWeather}.</span></p>
<p class="mt-1 text-xs text-volt-300">{streakWords(streakIfFishedToday)}</p>
