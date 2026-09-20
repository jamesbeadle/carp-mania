<script lang="ts">
	import type { BookingDiary } from '$lib/contracts/BookingDiary';
	import type { Lake } from '$lib/domain/types';
	import { dayWords, type DiaryDay } from '$lib/domain/water/bookings';
	import { untrack } from 'svelte';
	import StatRow from '../stats/StatRow.svelte';
	import PegRow from './PegRow.svelte';
	import { ticketsFromStat } from './ticketsFrom';

	let { lake, diary }: { lake: Lake; diary: BookingDiary } = $props();

	const now = new Date();
	let chosenDay = $state(untrack(() => diary.days[0]?.fisheryDay ?? 0));
	const days = $derived(diary.days);
	const day = $derived(days.find((candidate) => candidate.fisheryDay === chosenDay) ?? days[0]);
	const onSale = $derived(diary.book.filter((product) => product.is_on_sale));
	const myBookingsToday = $derived(diary.myBookings.filter((booking) => booking.fishery_day === chosenDay));
	const myPegsToday = $derived(myBookingsToday.map((booking) => booking.swim_id));
	const isChosen = (candidate: DiaryDay) => candidate.fisheryDay === chosenDay;
	const stats = $derived([
		{ label: 'Free pegs', value: String(day?.freePegs ?? 0), caption: `of ${diary.swims.length}`, tone: 'volt' as const },
		{ label: 'Yours', value: String(myPegsToday.length), caption: 'that day' },
		ticketsFromStat(diary.book),
		{ label: 'Bookable', value: String(days.length), caption: 'days ahead' }
	]);
</script>

<section class="panel">
	{#if !lake.is_booking_on}
		<p class="text-sm text-mist-400">This water is walk-on — buy a ticket at the office when you arrive.</p>
	{:else}
		<div class="mb-4 flex flex-wrap gap-2">
			{#each days as candidate (candidate.fisheryDay)}
				<button class="rounded-full px-3 py-1 text-sm" class:bg-volt-500={isChosen(candidate)} class:text-carbon-950={isChosen(candidate)} class:bg-carbon-800={!isChosen(candidate)} onclick={() => (chosenDay = candidate.fisheryDay)}>
					{dayWords(candidate, now)} · {candidate.freePegs} free
				</button>
			{/each}
		</div>
		<div class="mb-4"><StatRow {stats} /></div>
		{#if day}
			<ul class="divide-y divide-carbon-700/60">
				{#each diary.swims as swim (swim.id)}
					{@const isTaken = day.bookedSwimIds.includes(swim.id)}
					{@const isMine = myPegsToday.includes(swim.id)}
					<PegRow {swim} fisheryDay={day.fisheryDay} {isTaken} {isMine} {onSale} />
				{/each}
			</ul>
		{/if}
	{/if}
</section>
