<script lang="ts">
	import type { ListingPage } from '$lib/contracts/ListingPage';
	import { ReserveWords } from '$lib/domain/market/reserveState';
	import { formatMoney } from '$lib/format/money';
	import { timeLeft } from '$lib/format/timeLeft';
	import BidForms from './BidForms.svelte';
	import LandedCost from './LandedCost.svelte';
	import ListingOutcome from './ListingOutcome.svelte';
	import SellerNotice from './SellerNotice.svelte';

	let { page, now }: { page: ListingPage; now: Date } = $props();

	const CancelAction = '?/cancel';

	const listing = $derived(page.listing);
	const isOpen = $derived(listing.status === 'open');
	const isAuction = $derived(listing.kind === 'auction');
	const startingPrice = $derived(Number(listing.starting_price));
	const buyNowPrice = $derived(listing.buy_now_price === null ? null : Number(listing.buy_now_price));
	const currentBidLine = $derived(page.leadingBid === null ? `no bids · starts at ${formatMoney(startingPrice)}` : formatMoney(page.leadingBid));
	const priceForLanding = $derived(isAuction ? page.nextBid : buyNowPrice);
</script>

<section class="panel self-start">
	<p class="stat-label">{isAuction ? 'Auction' : 'Buy now'}{#if isOpen} · ends in {timeLeft(listing.ends_at, now)}{/if}</p>
	<h2 class="mb-2 text-2xl text-volt-300">{page.dossier.carp.name}</h2>
	{#if !isOpen}
		<ListingOutcome {page} />
	{:else}
		<dl class="grid grid-cols-[1fr_auto] gap-x-4 gap-y-1 text-sm">
			{#if isAuction}
				<dt class="text-mist-400">Current bid</dt>
				<dd class="text-right text-xl text-volt-300">{currentBidLine}</dd>
				<dt class="text-mist-400">Next bid</dt>
				<dd class="text-right text-mist-100">{formatMoney(page.nextBid)}</dd>
			{/if}
			{#if buyNowPrice !== null}
				<dt class="text-mist-400">Buy now</dt>
				<dd class="text-right text-mist-100">{formatMoney(buyNowPrice)}</dd>
			{/if}
			{#if isAuction}
				<dt class="text-mist-400">Reserve</dt>
				<dd class="text-right" class:text-volt-300={page.reserve === 'met'} class:text-mist-400={page.reserve !== 'met'}>{ReserveWords[page.reserve]}</dd>
			{/if}
		</dl>
		{#if page.isLeading}<p class="mt-2 text-sm text-volt-300">You're the leading bidder.</p>{/if}
		{#if page.isSeller}
			<SellerNotice {listing} bidCount={page.bids.length} cancelAction={CancelAction} />
		{:else}
			<LandedCost landed={page.landed} price={priceForLanding} />
			<BidForms {page} />
		{/if}
		<p class="mt-3 text-xs text-mist-400">Sold by {page.sellerName}. The fish keeps swimming until the hammer falls.</p>
	{/if}
</section>
