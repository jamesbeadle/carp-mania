<script lang="ts">
	import { DayTicketHoursPerPrice, type TicketProduct } from '$lib/domain/fishing/ticketBook';
	import { formatMoney } from '$lib/format/money';
	import StatRow from '../stats/StatRow.svelte';
	import DemandLine from './DemandLine.svelte';

	interface Props {
		willingness: number;
		anglersToday: number;
		book: TicketProduct[];
		swimCount: number;
	}

	let { willingness, anglersToday, book, swimCount }: Props = $props();

	const stats = $derived([
		{ label: 'They pay up to', value: formatMoney(willingness), caption: `for ${DayTicketHoursPerPrice} hours`, tone: 'volt' as const },
		{ label: 'Anglers a day', value: String(anglersToday), caption: 'on this book' },
		{ label: 'On the book', value: String(book.length), caption: book.length === 1 ? 'ticket' : 'tickets' },
		{ label: 'Swims', value: String(swimCount) }
	]);
</script>

<StatRow {stats} />
<div class="mt-4"><DemandLine anglersWanting={anglersToday} {swimCount} /></div>
