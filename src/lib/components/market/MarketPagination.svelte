<script lang="ts">
	import { MarketPaging, type MarketFilters } from '$lib/domain/market/marketFilters';
	import { marketPathFor } from '$lib/domain/market/readMarketFilters';

	let { filters, pageCount, total }: { filters: MarketFilters; pageCount: number; total: number } = $props();

	const hasPrevious = $derived(filters.page > MarketPaging.FirstPage);
	const hasNext = $derived(filters.page < pageCount);
	const listingsWord = $derived(`${total} ${total === 1 ? 'listing' : 'listings'}`);
</script>

{#if pageCount > MarketPaging.FirstPage}
	<nav class="mt-6 flex items-center gap-3 text-sm text-mist-400">
		{#if hasPrevious}<a href={marketPathFor(filters, filters.page - 1)} class="button-secondary px-3 py-1 text-base">Previous</a>{/if}
		<span>Page {filters.page} of {pageCount} · {listingsWord}</span>
		{#if hasNext}<a href={marketPathFor(filters, filters.page + 1)} class="button-secondary px-3 py-1 text-base">Next</a>{/if}
	</nav>
{/if}
