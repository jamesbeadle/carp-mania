<script lang="ts">
	import type { Listing } from '$lib/domain/marketTypes';
	import { formatMoney } from '$lib/format/money';

	let { listing, bidCount, cancelAction }: { listing: Listing; bidCount: number; cancelAction: string } = $props();

	const canCancel = $derived(bidCount === 0);
</script>

<div class="mt-4 border-t border-carbon-700/60 pt-3 text-sm">
	<p class="text-mist-100">This is your listing. The {formatMoney(listing.listing_fee)} fee is paid; the fish stays in your water and can be caught until it sells.</p>
	{#if canCancel}
		<form method="POST" action={cancelAction} class="mt-3">
			<input type="hidden" name="listingId" value={listing.id} />
			<button class="button-secondary">Take it off the market</button>
		</form>
	{:else}
		<p class="mt-2 text-xs text-mist-400">Someone has bid, so the listing runs to the end.</p>
	{/if}
</div>
