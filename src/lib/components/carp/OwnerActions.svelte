<script lang="ts">
	import type { CarpDossier } from '$lib/contracts/CarpDossier';
	import { DealerTerms, whyDealerRefuses } from '$lib/domain/market/dealer';
	import { formatMoney } from '$lib/format/money';

	let { dossier }: { dossier: CarpDossier } = $props();

	const UpForSale = 'Up for sale — take it off the market before the dealer can have it';

	const refusal = $derived(dossier.openListingId ? UpForSale : whyDealerRefuses(dossier.carp));
	const dealerSharePercent = Math.round(DealerTerms.ShareOfGuidePrice * 100);
	const bulkSharePercent = Math.round(DealerTerms.BulkShare * 100);
</script>

<section class="panel self-start">
	<p class="stat-label">Your fish</p>
	<h2 class="mb-4 text-2xl text-volt-300">What it's worth</h2>
	<dl class="grid grid-cols-2 gap-4 text-sm">
		<div><dt class="stat-label">Guide price</dt><dd class="text-2xl text-volt-300">{formatMoney(dossier.guidePrice)}</dd></div>
		<div><dt class="stat-label">Dealer offers</dt><dd class="text-2xl">{formatMoney(dossier.dealerOffer)}</dd></div>
	</dl>
	<form method="POST" action="/lake?/sellToDealer" class="mt-5 flex flex-wrap gap-3">
		<input type="hidden" name="carpId" value={dossier.carp.id} />
		<button class="button-secondary" disabled={refusal !== null} title={refusal ?? `Sell ${dossier.carp.name} to the dealer`}>Sell to the dealer</button>
		{#if dossier.openListingId}
			<a href="/market/{dossier.openListingId}" class="button-primary">See listing</a>
		{:else}
			<a href="/lake?list={dossier.carp.id}#market" class="button-primary">List on the market</a>
		{/if}
	</form>
	{#if refusal}
		<p class="mt-2 text-xs text-danger-400">{refusal}</p>
	{/if}
	<p class="mt-3 text-xs text-mist-400">The dealer pays {dealerSharePercent}% of guide on the spot for the first {DealerTerms.FullShareFishPerFisheryDay} fish a fishery day, and {bulkSharePercent}% after. The market is where the money is.</p>
</section>
