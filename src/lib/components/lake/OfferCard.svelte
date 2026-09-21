<script lang="ts">
	import { termWords, type SponsorshipOffer } from '$lib/domain/sponsorship/lakeSponsorship';
	import { BrandCatalogue, TierLabels } from '$lib/domain/tackle/brands';
	import { formatMoney } from '$lib/format/money';
	import { timeLeft } from '$lib/format/timeLeft';

	let { offer, now }: { offer: SponsorshipOffer; now: Date } = $props();

	const brand = $derived(BrandCatalogue[offer.brand]);
</script>

<li class="flex flex-col gap-3 rounded-xl border border-carbon-700 bg-carbon-950/60 p-4">
	<div class="flex items-start gap-3">
		<div class="min-w-0 flex-1">
			<p class="stat-label">{TierLabels[brand.tier]} brand · {termWords(offer.termMonths)} on the boards</p>
			<h4 class="font-display text-xl leading-tight font-bold text-mist-100">{brand.label}</h4>
			<p class="text-xs text-mist-400">{brand.story}</p>
		</div>
		<p class="text-right"><span class="font-display text-3xl leading-none font-extrabold text-volt-300 italic tabular-nums">{formatMoney(offer.amount)}</span><br /><span class="text-xs text-mist-400">paid on signing</span></p>
	</div>
	<div class="flex flex-wrap items-center gap-2">
		<span class="text-xs text-warning-500">Expires in {timeLeft(offer.expiresAt, now)}</span>
		<form method="POST" action="?/rejectOffer" class="ml-auto"><input type="hidden" name="offerId" value={offer.id} /><button class="button-secondary px-3 py-1 text-sm">Turn down</button></form>
		<form method="POST" action="?/acceptOffer"><input type="hidden" name="offerId" value={offer.id} /><button class="button-primary px-4 py-1 text-sm">Sign</button></form>
	</div>
</li>
