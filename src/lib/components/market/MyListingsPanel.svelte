<script lang="ts">
	import type { MyListing } from '$lib/contracts/MyMarketActivity';
	import { currentBidOf } from '$lib/domain/market/bidSummary';
	import type { ListingStatus } from '$lib/domain/marketTypes';
	import { formatMoney } from '$lib/format/money';
	import { timeLeft } from '$lib/format/timeLeft';
	import { formatWeight } from '$lib/format/weight';

	let { openListings, closedListings, now }: { openListings: MyListing[]; closedListings: MyListing[]; now: Date } = $props();

	const ClosedWords: Record<ListingStatus, string> = { open: 'open', sold: 'sold', unsold: 'unsold', cancelled: 'cancelled' };

	const priceLine = (mine: MyListing) =>
		mine.listing.kind === 'auction' ? `bid ${formatMoney(currentBidOf(Number(mine.listing.starting_price), mine.leadingBid))}` : `buy ${formatMoney(mine.listing.buy_now_price ?? mine.listing.starting_price)}`;
	const bidsWord = (count: number) => (count === 0 ? 'no bids' : `${count} ${count === 1 ? 'bid' : 'bids'}`);
</script>

<section class="panel">
	<h3 class="mb-3 text-xl text-volt-300">My listings</h3>
	{#if openListings.length === 0}
		<p class="text-sm text-mist-400">Nothing of yours is on the market.</p>
	{:else}
		<ul class="divide-y divide-carbon-700/60 text-sm">
			{#each openListings as mine (mine.listing.id)}
				<li class="flex flex-wrap items-center gap-x-3 gap-y-1 py-2">
					<a href="/market/{mine.listing.id}" class="font-medium text-mist-100 hover:underline">{mine.fish.name}</a>
					<span class="text-volt-300">{formatWeight(mine.fish.weightLb)}</span>
					<span class="text-mist-200">{priceLine(mine)}</span>
					<span class="text-mist-400">{bidsWord(mine.bidCount)} · {timeLeft(mine.listing.ends_at, now)}</span>
					{#if mine.bidCount === 0}
						<form method="POST" action="?/cancelListing" class="ml-auto">
							<input type="hidden" name="listingId" value={mine.listing.id} />
							<button class="button-secondary px-3 py-1 text-base">Cancel</button>
						</form>
					{/if}
				</li>
			{/each}
		</ul>
	{/if}
	{#if closedListings.length > 0}
		<h4 class="stat-label mt-4 mb-1">Closed</h4>
		<ul class="divide-y divide-carbon-700/60 text-sm">
			{#each closedListings as mine (mine.listing.id)}
				<li class="flex flex-wrap items-baseline gap-x-3 gap-y-1 py-1.5">
					<a href="/market/{mine.listing.id}" class="text-mist-100 hover:underline">{mine.fish.name}</a>
					<span class="text-mist-400">{ClosedWords[mine.listing.status]}</span>
					{#if mine.listing.sold_price !== null}<span class="ml-auto text-volt-300">{formatMoney(mine.listing.sold_price)}</span>{/if}
				</li>
			{/each}
		</ul>
	{/if}
</section>
