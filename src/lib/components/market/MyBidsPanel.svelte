<script lang="ts">
	import type { MyBid } from '$lib/contracts/MyMarketActivity';
	import { landedCost } from '$lib/domain/market/bidRules';
	import { formatMoney } from '$lib/format/money';
	import { timeLeft } from '$lib/format/timeLeft';
	import { formatWeight } from '$lib/format/weight';

	let { leadingBids, outbidBids, now }: { leadingBids: MyBid[]; outbidBids: MyBid[]; now: Date } = $props();

	const heldFor = (mine: MyBid) => landedCost(Number(mine.bid.amount), Number(mine.bid.transport_cost));
</script>

<section class="panel">
	<h3 class="mb-3 text-xl text-volt-300">My bids</h3>
	{#if leadingBids.length === 0 && outbidBids.length === 0}
		<p class="text-sm text-mist-400">You're not bidding on anything. <a href="/market" class="text-volt-300 hover:underline">Browse the market</a></p>
	{/if}
	{#if leadingBids.length > 0}
		<h4 class="stat-label mb-1">Leading</h4>
		<ul class="divide-y divide-carbon-700/60 text-sm">
			{#each leadingBids as mine (mine.bid.id)}
				<li class="flex flex-wrap items-baseline gap-x-3 gap-y-1 py-2">
					<a href="/market/{mine.listing.id}" class="font-medium text-mist-100 hover:underline">{mine.fish.name}</a>
					<span class="text-volt-300">{formatWeight(mine.fish.weightLb)}</span>
					<span class="text-mist-200">your bid {formatMoney(mine.bid.amount)}</span>
					<span class="text-mist-400">{formatMoney(heldFor(mine))} held with transport · {mine.lakeName} · {timeLeft(mine.listing.ends_at, now)}</span>
				</li>
			{/each}
		</ul>
	{/if}
	{#if outbidBids.length > 0}
		<h4 class="stat-label mt-4 mb-1">Outbid</h4>
		<ul class="divide-y divide-carbon-700/60 text-sm">
			{#each outbidBids as mine (mine.bid.id)}
				<li class="flex flex-wrap items-baseline gap-x-3 gap-y-1 py-2">
					<a href="/market/{mine.listing.id}" class="font-medium text-mist-100 hover:underline">{mine.fish.name}</a>
					<span class="text-volt-300">{formatWeight(mine.fish.weightLb)}</span>
					<span class="text-danger-400">you bid {formatMoney(mine.bid.amount)}</span>
					{#if mine.leadingBid !== null}<span class="text-mist-200">now {formatMoney(mine.leadingBid)}</span>{/if}
					<span class="text-mist-400">{timeLeft(mine.listing.ends_at, now)}</span>
					<a href="/market/{mine.listing.id}" class="button-secondary ml-auto px-3 py-1 text-base">Bid again</a>
				</li>
			{/each}
		</ul>
	{/if}
</section>
