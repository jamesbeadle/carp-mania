<script lang="ts">
	import type { MyMarketActivity } from '$lib/contracts/MyMarketActivity';
	import { currentBidOf } from '$lib/domain/market/bidSummary';
	import { formatMoney } from '$lib/format/money';
	import { timeLeft } from '$lib/format/timeLeft';
	import { TickingClock } from '../market/tickingClock.svelte';

	let { watch, loadedAt }: { watch: MyMarketActivity; loadedAt: string } = $props();

	const clock = new TickingClock();
	const now = $derived(clock.nowOr(loadedAt));
	$effect(() => clock.start());

	const listingCount = $derived(watch.openListings.length);
	const bidCount = $derived(watch.leadingBids.length + watch.outbidBids.length);
	const headline = $derived(
		listingCount + bidCount === 0 ? 'Quiet' : [countWord(listingCount, 'listing'), countWord(bidCount, 'bid')].filter((part) => part !== null).join(' · ')
	);

	function countWord(count: number, noun: string) {
		if (count === 0) return null;
		return `${count} ${noun}${count === 1 ? '' : 's'}`;
	}
</script>

<section class="panel">
	<p class="stat-label">Market watch</p>
	<h2 class="mb-4 text-3xl text-volt-300">{headline}</h2>
	{#if listingCount + bidCount === 0}
		<p class="text-sm text-mist-400">Nothing of yours is on the market and you're not bidding. Prize fish turn into money here.</p>
	{:else}
		<ul class="divide-y divide-carbon-700/60 text-sm">
			{#each watch.openListings as mine (mine.listing.id)}
				<li class="flex flex-wrap items-baseline gap-x-3 gap-y-1 py-2">
					<a href="/market/{mine.listing.id}" class="text-mist-100 hover:underline">{mine.fish.name}</a>
					<span class="text-mist-400">selling</span>
					<span class="text-volt-300">{formatMoney(mine.listing.kind === 'auction' ? currentBidOf(Number(mine.listing.starting_price), mine.leadingBid) : Number(mine.listing.buy_now_price))}</span>
					<span class="ml-auto text-xs text-mist-400">{timeLeft(mine.listing.ends_at, now)}</span>
				</li>
			{/each}
			{#each watch.leadingBids as mine (mine.bid.id)}
				<li class="flex flex-wrap items-baseline gap-x-3 gap-y-1 py-2">
					<a href="/market/{mine.listing.id}" class="text-mist-100 hover:underline">{mine.fish.name}</a>
					<span class="text-volt-300">leading at {formatMoney(mine.bid.amount)}</span>
					<span class="ml-auto text-xs text-mist-400">{timeLeft(mine.listing.ends_at, now)}</span>
				</li>
			{/each}
			{#each watch.outbidBids as mine (mine.bid.id)}
				<li class="flex flex-wrap items-baseline gap-x-3 gap-y-1 py-2">
					<a href="/market/{mine.listing.id}" class="text-mist-100 hover:underline">{mine.fish.name}</a>
					<span class="text-danger-400">outbid{#if mine.leadingBid !== null} · now {formatMoney(mine.leadingBid)}{/if}</span>
					<span class="ml-auto text-xs text-mist-400">{timeLeft(mine.listing.ends_at, now)}</span>
				</li>
			{/each}
		</ul>
	{/if}
	<div class="mt-5 flex gap-3">
		<a href="/market" class="button-secondary">The market</a>
		<a href="/lake#market" class="button-secondary">My listings</a>
	</div>
</section>
