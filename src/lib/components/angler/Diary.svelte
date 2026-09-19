<script lang="ts">
	import type { MyDiaryEntry } from '$lib/contracts/MyDiary';
	import { dayWords, fisheryDayStart } from '$lib/domain/water/bookings';
	import { formatWhen } from '$lib/format/dates';

	let { entries }: { entries: MyDiaryEntry[] } = $props();

	const now = new Date();
	const dayOf = (fisheryDay: number) => ({ fisheryDay, startsAt: fisheryDayStart(fisheryDay), freePegs: 0, bookedSwimIds: [] });
</script>

<section class="panel">
	<h2 class="mb-1 text-xl text-volt-300">The diary</h2>
	{#if entries.length === 0}
		<p class="text-sm text-mist-400">No pegs booked. A water with advance booking on takes bookings a week ahead from its page.</p>
	{:else}
		<ul class="divide-y divide-carbon-700/60 text-sm">
			{#each entries as entry (entry.booking.id)}
				{@const day = dayOf(entry.booking.fishery_day)}
				<li class="flex flex-wrap items-center gap-3 py-2">
					<span class="font-medium text-mist-100">{dayWords(day, now)}</span>
					<span class="text-mist-400">{formatWhen(day.startsAt.toISOString())}</span>
					<a href="/lakes/{entry.booking.lake_id}" class="text-volt-300 hover:underline">{entry.lakeName}</a>
					<span class="text-mist-400">· {entry.swimName}</span>
				</li>
			{/each}
		</ul>
	{/if}
</section>
