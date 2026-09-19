<script lang="ts">
	import { productLabel, ticketCostOf, type TicketProduct } from '$lib/domain/fishing/ticketBook';
	import { weatherWords } from '$lib/domain/fishing/weatherConditions';
	import type { Shoal } from '$lib/domain/stock/shoals';
	import { stockBySize, type SizeCount } from '$lib/domain/stock/stockBySize';
	import type { Carp, Lake } from '$lib/domain/types';
	import { nextFreeDay, dayWords, type DiaryDay } from '$lib/domain/water/bookings';
	import { syndicateWords, isSyndicateWater } from '$lib/domain/water/syndicate';
	import { weatherFor } from '$lib/domain/world/weather';
	import { formatMoney } from '$lib/format/money';
	import { formatWeight } from '$lib/format/weight';

	interface Props {
		lake: Lake;
		carp: Carp[];
		shoals: Shoal[];
		book: TicketProduct[];
		diary: DiaryDay[];
		now: Date;
	}

	let { lake, carp, shoals, book, diary, now }: Props = $props();

	const heaviest = $derived(carp.reduce((best, fish) => Math.max(best, Number(fish.weight_lb)), 0));
	const bands = $derived(stockBySize(carp, shoals).filter((line) => line.count > 0));
	const nextFree = $derived(nextFreeDay(diary));
	const walkOnWords = $derived(walkOn());
	const onSale = $derived(book.filter((product) => product.is_on_sale));
	const bandWords = $derived(bands.map(bandLine).join(' · '));

	function bandLine(line: SizeCount) {
		const label = line.band.label.toLowerCase();
		return `${line.count} ${label}`;
	}

	function walkOn() {
		if (isSyndicateWater(lake)) return syndicateWords(lake);
		if (!lake.is_booking_on) return 'Walk on — buy a ticket when you arrive.';
		return nextFree ? `Advance booking — next free peg ${dayWords(nextFree, now).toLowerCase()}.` : 'Advance booking — full for the week.';
	}
</script>

<div class="grid gap-3 sm:grid-cols-2">
	<div class="rounded-xl border border-carbon-700/60 bg-carbon-900/60 p-4">
		<p class="stat-label">The best fish in it</p>
		<p class="text-2xl text-volt-300">{heaviest > 0 ? formatWeight(heaviest) : 'Nothing landed yet'}</p>
		<p class="mt-1 text-xs text-mist-400">{bandWords}</p>
	</div>
	<div class="rounded-xl border border-carbon-700/60 bg-carbon-900/60 p-4">
		<p class="stat-label">Getting on</p>
		<p class="text-sm text-mist-100">{walkOnWords}</p>
		<p class="mt-1 text-xs text-mist-400">{onSale.map((product) => `${productLabel(product)} ${formatMoney(ticketCostOf(product))}`).join(' · ')}</p>
		<p class="mt-1 text-xs text-mist-400">Today: {weatherWords(weatherFor(lake, now))}.</p>
	</div>
</div>
