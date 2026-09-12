<script lang="ts">
	import type { ListingPage } from '$lib/contracts/ListingPage';
	import { BidTerms } from '$lib/domain/market/bidRules';
	import { formatMoney } from '$lib/format/money';

	let { page }: { page: ListingPage } = $props();

	const listing = $derived(page.listing);
	const isAuction = $derived(listing.kind === 'auction');
	const canShipToMe = $derived(page.landed.state === 'quoted');
	const buyNowPrice = $derived(listing.buy_now_price === null ? null : Number(listing.buy_now_price));
	const nextBid = $derived(page.nextBid);

	let amount = $state(0);
	$effect(() => {
		amount = nextBid;
	});
</script>

<div class="mt-4 flex flex-col gap-3">
	{#if isAuction}
		<form method="POST" action="?/bid" class="flex flex-wrap items-center gap-2">
			<input type="hidden" name="listingId" value={listing.id} />
			<input name="amount" type="number" min={nextBid} step={BidTerms.RoundUpTo} bind:value={amount} class="field w-36" aria-label="Your bid in pounds" />
			<button class="button-primary" disabled={!canShipToMe || page.isLeading}>Bid {formatMoney(amount)}</button>
		</form>
	{/if}
	{#if buyNowPrice !== null}
		<form method="POST" action="?/buyNow">
			<input type="hidden" name="listingId" value={listing.id} />
			<button class="button-secondary" disabled={!canShipToMe}>Buy now for {formatMoney(buyNowPrice)}</button>
		</form>
	{/if}
	{#if page.isLeading}
		<p class="text-xs text-mist-400">Your bid and the transport are held until the auction ends or you're outbid.</p>
	{/if}
</div>
