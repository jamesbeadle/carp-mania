<script lang="ts">
	import Facets from '$lib/components/market/Facets.svelte';
	import ListingCard from '$lib/components/market/ListingCard.svelte';
	import MarketIndex from '$lib/components/market/MarketIndex.svelte';
	import MarketPagination from '$lib/components/market/MarketPagination.svelte';
	import { TickingClock } from '$lib/components/market/tickingClock.svelte';

	let { data } = $props();

	const clock = new TickingClock();
	const now = $derived(clock.nowOr(data.loadedAt));
	$effect(() => clock.start());
</script>

<h1 class="mb-2 text-4xl text-volt-300">The fish market</h1>
<p class="mb-4 text-mist-400">Every fish for sale across the whole world. The seller pays the commission; you pay the transport to your water.</p>

<Facets filters={data.market.filters} />
<MarketIndex bands={data.index} />

{#if data.market.cards.length === 0}
	<section class="panel text-center">
		<p class="text-lg text-mist-200">Nothing on the market right now — the fish farm always has stock.</p>
		<a href="/lake" class="button-primary mt-4 inline-block">Buy from the farm</a>
	</section>
{:else}
	<div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
		{#each data.market.cards as card (card.id)}
			<ListingCard {card} {now} />
		{/each}
	</div>
{/if}

<MarketPagination filters={data.market.filters} pageCount={data.market.pageCount} total={data.market.total} />
