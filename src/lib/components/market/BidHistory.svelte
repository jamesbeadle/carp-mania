<script lang="ts">
	import type { ListingBid } from '$lib/contracts/ListingPage';
	import type { BidStatus } from '$lib/domain/marketTypes';
	import { formatWhen } from '$lib/format/dates';
	import { formatMoney } from '$lib/format/money';

	let { bids }: { bids: ListingBid[] } = $props();

	const StatusWords: Record<BidStatus, string> = { leading: 'leading', outbid: 'outbid', won: 'won', refunded: 'refunded' };
</script>

<section class="panel">
	<h3 class="mb-3 text-xl text-volt-300">Bids ({bids.length})</h3>
	{#if bids.length === 0}
		<p class="text-sm text-mist-400">No bids yet.</p>
	{:else}
		<ul class="divide-y divide-carbon-700/60">
			{#each bids as bid (bid.id)}
				<li class="flex flex-wrap items-baseline gap-x-3 gap-y-1 py-2 text-sm">
					<span class="font-semibold" class:text-volt-300={bid.status === 'leading' || bid.status === 'won'} class:text-mist-200={bid.status !== 'leading' && bid.status !== 'won'}>{formatMoney(bid.amount)}</span>
					<a href="/anglers/{bid.bidderId}" class="text-mist-100 hover:underline">{bid.bidderName}</a>
					<span class="text-xs text-mist-400">{StatusWords[bid.status]}</span>
					<span class="ml-auto text-xs text-mist-400">{formatWhen(bid.placedAt)}</span>
				</li>
			{/each}
		</ul>
	{/if}
</section>
