<script lang="ts">
	import { daysOf, hoursOf, productLabel, ticketCostOf, TicketKindCatalogue, type TicketProduct } from '$lib/domain/fishing/ticketBook';
	import { formatMoney } from '$lib/format/money';

	interface Props {
		book: TicketProduct[];
		money: number;
		isFree: boolean;
		freeWords: string;
	}

	let { book, money, isFree, freeWords }: Props = $props();

	const onSale = $derived(book.filter((product) => product.is_on_sale));
	const canAfford = (product: TicketProduct) => isFree || money >= ticketCostOf(product);
	const priceWords = (product: TicketProduct) => (isFree ? freeWords : formatMoney(ticketCostOf(product)));
	const hoursWords = (product: TicketProduct) => `${hoursOf(product.kind) * daysOf(product)} hours`;
</script>

{#if onSale.length === 0}
	<p class="text-sm text-mist-400">This water has no tickets on sale.</p>
{:else}
	<ul class="divide-y divide-carbon-700/60">
		{#each onSale as product (product.id)}
			<li class="flex flex-wrap items-center gap-x-4 gap-y-1 py-3">
				<div class="min-w-0 flex-1">
					<p class="flex flex-wrap items-baseline gap-x-2"><span class="font-medium text-mist-100">{productLabel(product)}</span><span class="text-xs text-mist-400">{hoursWords(product)}</span></p>
					<p class="text-xs text-mist-400">{TicketKindCatalogue[product.kind].words}</p>
				</div>
				<form method="POST" action="?/buyTicket">
					<input type="hidden" name="productId" value={product.id} />
					<button class="button-primary px-5 py-2" disabled={!canAfford(product)} title={canAfford(product) ? `Buy a ${productLabel(product)} ticket` : `You need ${formatMoney(ticketCostOf(product))}`}>{priceWords(product)}</button>
				</form>
			</li>
		{/each}
	</ul>
{/if}
