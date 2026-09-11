<script lang="ts">
	import type { MarketListingCard } from '$lib/contracts/MarketListingCard';
	import { currentBidOf } from '$lib/domain/market/bidSummary';
	import { StrainCatalogue } from '$lib/domain/strains';
	import { RegionCatalogue } from '$lib/domain/world/regions';
	import { formatMoney } from '$lib/format/money';
	import { timeLeft } from '$lib/format/timeLeft';
	import { formatWeight } from '$lib/format/weight';
	import CarpPortrait from '../carp/CarpPortrait.svelte';

	let { card, now }: { card: MarketListingCard; now: Date } = $props();

	const PrivateWater = 'a private water';

	const isAuction = $derived(card.kind === 'auction');
	const priceLine = $derived(
		isAuction ? `Bid ${formatMoney(currentBidOf(card.startingPrice, card.leadingBid))}` : `Buy ${formatMoney(card.buyNowPrice ?? card.startingPrice)}`
	);
	const bidsLine = $derived(card.bidCount === 0 ? 'no bids' : `${card.bidCount} ${card.bidCount === 1 ? 'bid' : 'bids'}`);
	const whereLine = $derived(card.lake ? RegionCatalogue[card.lake.region].label : PrivateWater);
</script>

<a href="/market/{card.id}" class="panel flex flex-col gap-2 transition hover:border-volt-500/60 hover:shadow-volt">
	<CarpPortrait strain={card.carp.strain} weightLb={card.carp.weightLb} />
	<h2 class="text-2xl text-volt-300">{card.carp.name} · {formatWeight(card.carp.weightLb)}</h2>
	<p class="text-sm text-mist-400">{StrainCatalogue[card.carp.strain].label.toLowerCase()} · {whereLine}</p>
	<p class="font-display text-xl font-bold tracking-wide text-mist-100 uppercase italic">{priceLine}</p>
	<p class="text-sm text-mist-400">{#if isAuction}{bidsLine} · {/if}{timeLeft(card.endsAt, now)}</p>
</a>
