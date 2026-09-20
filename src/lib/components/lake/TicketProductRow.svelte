<script lang="ts">
	import { hoursOf, productLabel, ticketCostOf, type TicketProduct } from '$lib/domain/fishing/ticketBook';
	import { affordabilityOf, TicketDemand } from '$lib/domain/simulation/ticketChoice';
	import { formatMoney } from '$lib/format/money';

	let { product, willingness, canRemove }: { product: TicketProduct; willingness: number; canRemove: boolean } = $props();

	const affordability = $derived(affordabilityOf(product, willingness));
	const demandWords = $derived(demandWordsFor(affordability));

	function demandWordsFor(share: number) {
		if (share < TicketDemand.NobodyBuysBelow) return 'nobody will buy this';
		if (share < 1) return 'dear — some will pass';
		return 'sells';
	}
</script>

<li class="flex flex-wrap items-center gap-x-3 gap-y-1 py-2 text-sm">
	<span class="font-medium text-mist-100">{productLabel(product)}</span>
	<span class="text-xs text-mist-400">{hoursOf(product.kind)} hours{product.kind === 'multi_day' ? ` × ${product.days}` : ''}</span>
	<span class="text-volt-300">{formatMoney(ticketCostOf(product))}</span>
	<span class="text-xs" class:text-mist-400={affordability >= 1} class:text-danger-400={affordability < TicketDemand.NobodyBuysBelow} class:text-surge-300={affordability >= TicketDemand.NobodyBuysBelow && affordability < 1}>{demandWords}</span>
	<form method="POST" action="?/removeTicket" class="ml-auto">
		<input type="hidden" name="productId" value={product.id} />
		<button class="button-secondary px-3 py-1 text-base" disabled={!canRemove} title={canRemove ? 'Take this ticket off the book' : 'Keep at least one ticket on sale'}>Remove</button>
	</form>
</li>
