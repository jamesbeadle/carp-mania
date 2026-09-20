<script lang="ts">
	import { MultiDay, TicketKindCatalogue, TicketKinds, TicketPrice, type TicketProduct } from '$lib/domain/fishing/ticketBook';
	import { anglersArrivingToday, willingnessToPayFor } from '$lib/domain/simulation/visitingAnglers';
	import type { Lake } from '$lib/domain/types';
	import { formatMoney } from '$lib/format/money';
	import TicketProductRow from './TicketProductRow.svelte';
	import DemandLine from './DemandLine.svelte';
	import BookingSwitches from './BookingSwitches.svelte';

	let { lake, book, swimCount, stockDraw }: { lake: Lake; book: TicketProduct[]; swimCount: number; stockDraw: number } = $props();

	let kind = $state<TicketProduct['kind']>('day');
	const willingness = $derived(willingnessToPayFor(Number(lake.reputation), lake.region));
	const anglersToday = $derived(anglersArrivingToday(lake, undefined, book, stockDraw));
	const isMultiDay = $derived(kind === 'multi_day');
	const canRemove = $derived(book.filter((product) => product.is_on_sale).length > 1);
</script>

<section class="panel">
	<h3 class="mb-1 text-xl text-volt-300">The ticket book</h3>
	<p class="mb-4 text-sm text-mist-400">
		Anglers here will pay about {formatMoney(willingness)} for twelve hours; price a ticket above that per twelve hours and fewer buy it. About {anglersToday} a day are coming on this book.
		A 24-hour ticket has both magic windows in it and is worth about two and a half day tickets to a serious angler.
	</p>
	<DemandLine anglersWanting={anglersToday} {swimCount} />
	<ul class="mb-4 divide-y divide-carbon-700/60">
		{#each book as product (product.id)}
			<TicketProductRow {product} {willingness} {canRemove} />
		{/each}
	</ul>
	<form method="POST" action="?/addTicket" class="flex flex-wrap items-end gap-2">
		<label class="block text-xs text-mist-400">
			Ticket
			<select name="kind" bind:value={kind} class="field mt-1">
				{#each TicketKinds as candidate (candidate)}<option value={candidate}>{TicketKindCatalogue[candidate].label}</option>{/each}
			</select>
		</label>
		{#if isMultiDay}
			<label class="block text-xs text-mist-400">Days<input name="days" type="number" min={MultiDay.FewestDays} max={MultiDay.MostDays} value={MultiDay.FewestDays} class="field mt-1 w-20" /></label>
		{/if}
		<label class="block text-xs text-mist-400">
			{isMultiDay ? 'Price a day (£)' : 'Price (£)'}
			<input name="price" type="number" min={TicketPrice.Lowest} max={TicketPrice.Highest} step="1" value={Number(lake.day_ticket_fee)} class="field mt-1 w-28" />
		</label>
		<button class="button-primary">Add to the book</button>
	</form>
	<BookingSwitches {lake} />
	<form method="POST" action="?/setBarbedRule" class="mt-4 flex flex-wrap items-center gap-3 text-sm text-mist-200">
		<input type="hidden" name="isBarbedBanned" value={lake.is_barbed_banned ? 'false' : 'true'} />
		<span class="min-w-0 flex-1 basis-56">{lake.is_barbed_banned ? 'Barbed hooks are banned here.' : 'Barbed hooks are allowed here.'}</span>
		<button class="button-secondary px-3 py-1 text-base whitespace-nowrap">{lake.is_barbed_banned ? 'Allow barbed hooks' : 'Ban barbed hooks'}</button>
	</form>
</section>
