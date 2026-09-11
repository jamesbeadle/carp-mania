<script lang="ts">
	import type { ListingPage } from '$lib/contracts/ListingPage';
	import { sellerReceives } from '$lib/domain/market/listingRules';
	import type { ListingStatus } from '$lib/domain/marketTypes';
	import { formatWhen } from '$lib/format/dates';
	import { formatMoney } from '$lib/format/money';

	let { page }: { page: ListingPage } = $props();

	const listing = $derived(page.listing);
	const soldPrice = $derived(listing.sold_price === null ? null : Number(listing.sold_price));
	const Outcomes: Record<ListingStatus, string> = {
		open: 'Still open',
		sold: 'Sold',
		unsold: 'Unsold — nobody bought it, or the bidding never reached the reserve',
		cancelled: 'Taken off the market by the seller'
	};
</script>

<div class="mt-2 text-sm">
	<p class="text-2xl text-volt-300">{Outcomes[listing.status]}</p>
	{#if listing.status === 'sold' && soldPrice !== null}
		<p class="mt-1 text-mist-100">
			{formatMoney(soldPrice)} to {page.buyerName ?? 'an angler'}
			{#if page.isSeller}<span class="text-mist-400">· {formatMoney(sellerReceives(soldPrice))} to you after commission</span>{/if}
		</p>
	{/if}
	{#if listing.settled_at}<p class="mt-1 text-xs text-mist-400">{formatWhen(listing.settled_at)}</p>{/if}
	<p class="mt-3 text-mist-400">Sold by {page.sellerName}.</p>
	<a href="/market" class="button-secondary mt-4 inline-block">Back to the market</a>
</div>
