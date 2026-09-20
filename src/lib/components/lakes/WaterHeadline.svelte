<script lang="ts">
	import type { TicketProduct } from '$lib/domain/fishing/ticketBook';
	import { weatherWords } from '$lib/domain/fishing/weatherConditions';
	import { headCountIn } from '$lib/domain/stock/headCount';
	import type { Shoal } from '$lib/domain/stock/shoals';
	import { stockBySize, type SizeCount } from '$lib/domain/stock/stockBySize';
	import type { Carp, Lake } from '$lib/domain/types';
	import type { DiaryDay } from '$lib/domain/water/bookings';
	import { weatherFor } from '$lib/domain/world/weather';
	import { formatWeight } from '$lib/format/weight';
	import StatRow from '../stats/StatRow.svelte';
	import { gettingOnStat } from './gettingOn';
	import { ticketsFromStat } from './ticketsFrom';

	interface Props {
		lake: Lake;
		carp: Carp[];
		shoals: Shoal[];
		book: TicketProduct[];
		diary: DiaryDay[];
		now: Date;
	}

	let { lake, carp, shoals, book, diary, now }: Props = $props();

	const NothingYet = '—';
	const heaviest = $derived(carp.reduce((best, fish) => Math.max(best, Number(fish.weight_lb)), 0));
	const bands = $derived(stockBySize(carp, shoals).filter((line) => line.count > 0));
	const bandWords = $derived(bands.map(bandLine).join(' · '));
	const gettingOn = $derived(gettingOnStat(lake, diary, now));
	const stats = $derived([
		{ label: 'Biggest', value: heaviest > 0 ? formatWeight(heaviest) : NothingYet, tone: 'volt' as const },
		{ label: 'Stock', value: String(headCountIn(carp, shoals)), caption: 'carp' },
		{ ...ticketsFromStat(book), label: 'From' },
		{ label: gettingOn.label, value: gettingOn.value }
	]);
	const lines = $derived([
		{ label: 'Sizes', words: bandWords || 'nothing stocked yet' },
		{ label: gettingOn.value, words: gettingOn.caption },
		{ label: 'Today', words: weatherWords(weatherFor(lake, now)) }
	]);

	function bandLine(line: SizeCount) {
		return `${line.count} ${line.band.label.toLowerCase()}`;
	}
</script>

<StatRow {stats} />
<dl class="mt-3 space-y-1 text-xs text-mist-400">
	{#each lines as line (line.label)}
		<div class="flex flex-wrap items-baseline gap-x-2"><dt class="stat-label">{line.label}</dt><dd>{line.words}</dd></div>
	{/each}
</dl>
