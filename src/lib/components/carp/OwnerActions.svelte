<script lang="ts">
	import type { CarpDossier } from '$lib/contracts/CarpDossier';
	import { DealerTerms, whyDealerRefuses } from '$lib/domain/market/dealer';
	import { formatMoney } from '$lib/format/money';
	import AboutToggle from '../stats/AboutToggle.svelte';
	import StatRow from '../stats/StatRow.svelte';

	let { dossier }: { dossier: CarpDossier } = $props();

	const refusal = $derived(whyDealerRefuses(dossier.carp));
	const dealerSharePercent = Math.round(DealerTerms.ShareOfGuidePrice * 100);
	const bulkSharePercent = Math.round(DealerTerms.BulkShare * 100);
	const stats = $derived([
		{ label: 'Guide price', value: formatMoney(dossier.guidePrice), tone: 'volt' as const },
		{ label: 'Dealer offers', value: formatMoney(dossier.dealerOffer), caption: 'on the spot' }
	]);
</script>

<section class="panel self-start">
	<p class="stat-label">Your fish</p>
	<h2 class="mb-4 text-2xl text-volt-300">What it's worth</h2>
	<StatRow {stats} />
	<form method="POST" action="/lake?/sellToDealer" class="mt-5 flex flex-wrap gap-3">
		<input type="hidden" name="carpId" value={dossier.carp.id} />
		<button class="button-secondary" disabled={refusal !== null} title={refusal ?? `Sell ${dossier.carp.name} to the dealer`}>Sell to the dealer</button>
	</form>
	{#if refusal}
		<p class="mt-2 text-xs text-danger-400">{refusal}</p>
	{/if}
	<div class="mt-4">
		<AboutToggle title="About the dealer">Pays {dealerSharePercent}% of guide on the spot for the first {DealerTerms.FullShareFishPerFisheryDay} fish a fishery day, and {bulkSharePercent}% after. Fish leave a water through the dealer only, so nobody can be paid by a second account.</AboutToggle>
	</div>
</section>
