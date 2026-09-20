<script lang="ts">
	import { DayTicketHoursPerPrice, type TicketProduct } from '$lib/domain/fishing/ticketBook';
	import { anglersArrivingToday, willingnessToPayFor } from '$lib/domain/simulation/visitingAnglers';
	import type { Lake } from '$lib/domain/types';
	import AboutToggle from '../stats/AboutToggle.svelte';
	import AddTicketForm from './AddTicketForm.svelte';
	import BookingSwitches from './BookingSwitches.svelte';
	import TicketBookStats from './TicketBookStats.svelte';
	import TicketProductRow from './TicketProductRow.svelte';

	let { lake, book, swimCount, stockDraw }: { lake: Lake; book: TicketProduct[]; swimCount: number; stockDraw: number } = $props();

	const willingness = $derived(willingnessToPayFor(Number(lake.reputation), lake.region));
	const anglersToday = $derived(anglersArrivingToday(lake, undefined, book, stockDraw));
	const canRemove = $derived(book.filter((product) => product.is_on_sale).length > 1);
</script>

<section class="panel @container">
	<h3 class="mb-3 text-xl text-volt-300">The ticket book</h3>
	<TicketBookStats {willingness} {anglersToday} {book} {swimCount} />
	<ul class="my-4 divide-y divide-carbon-700/60">
		{#each book as product (product.id)}
			<TicketProductRow {product} {willingness} {canRemove} />
		{/each}
	</ul>
	<AddTicketForm dayTicketFee={Number(lake.day_ticket_fee)} />
	<BookingSwitches {lake} />
	<form method="POST" action="?/setBarbedRule" class="mt-4 flex flex-wrap items-center gap-3 text-sm text-mist-200">
		<input type="hidden" name="isBarbedBanned" value={lake.is_barbed_banned ? 'false' : 'true'} />
		<span class="min-w-0 flex-1 basis-56">{lake.is_barbed_banned ? 'Barbed hooks are banned here.' : 'Barbed hooks are allowed here.'}</span>
		<button class="button-secondary px-3 py-1 text-base whitespace-nowrap">{lake.is_barbed_banned ? 'Allow barbed hooks' : 'Ban barbed hooks'}</button>
	</form>
	<div class="mt-4">
		<AboutToggle title="About pricing">Price a ticket above what anglers here will pay per {DayTicketHoursPerPrice} hours and fewer buy it. A 24-hour ticket has both magic windows in it and is worth about two and a half day tickets to a serious angler.</AboutToggle>
	</div>
</section>
