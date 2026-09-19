<script lang="ts">
	import { productLabel, ticketCostOf, type TicketProduct } from '$lib/domain/fishing/ticketBook';
	import type { Swim } from '$lib/domain/types';
	import { formatMoney } from '$lib/format/money';

	interface Props {
		swim: Swim;
		fisheryDay: number;
		isTaken: boolean;
		isMine: boolean;
		onSale: TicketProduct[];
	}

	let { swim, fisheryDay, isTaken, isMine, onSale }: Props = $props();

	const productWords = (product: TicketProduct) => `${productLabel(product)} · ${formatMoney(ticketCostOf(product))}`;
</script>

<li class="flex flex-wrap items-center gap-3 py-2 text-sm">
	<span class="font-medium text-mist-100">{swim.name}</span>
	{#if isMine}
		<span class="text-volt-300">Yours</span>
	{:else if isTaken}
		<span class="text-mist-400">Booked</span>
	{:else}
		<form method="POST" action="?/book" class="ml-auto flex items-center gap-2">
			<input type="hidden" name="swimId" value={swim.id} />
			<input type="hidden" name="fisheryDay" value={fisheryDay} />
			<select name="productId" class="field py-1 text-sm">
				{#each onSale as product (product.id)}<option value={product.id}>{productWords(product)}</option>{/each}
			</select>
			<button class="button-primary px-3 py-1 text-base">Book</button>
		</form>
	{/if}
</li>
