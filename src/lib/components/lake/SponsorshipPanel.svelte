<script lang="ts">
	import type { LakeSponsorshipPanel } from '$lib/contracts/LakeSponsorshipPanel';
	import { OfferLife, SponsorshipTerm } from '$lib/domain/sponsorship/lakeSponsorship';
	import { whatOffersDependOn } from '$lib/domain/sponsorship/offerWords';
	import AboutToggle from '../stats/AboutToggle.svelte';
	import DealCard from './DealCard.svelte';
	import OfferCard from './OfferCard.svelte';

	let { sponsorship }: { sponsorship: LakeSponsorshipPanel } = $props();

	const now = $derived(new Date(sponsorship.loadedAt));
	const hasOffers = $derived(sponsorship.offers.length > 0);
	const LongestYears = (SponsorshipTerm.MostTerms * SponsorshipTerm.MonthsPerTerm) / 12;
</script>

<section class="panel space-y-4">
	<div>
		<h3 class="text-xl text-volt-300">Sponsors</h3>
		<p class="text-sm text-mist-400">{whatOffersDependOn(sponsorship.waterRating)}</p>
	</div>
	{#if sponsorship.deal}<DealCard deal={sponsorship.deal} {now} />{/if}
	<div>
		<h4 class="mb-2 text-sm font-medium text-mist-100">Offers on the table</h4>
		{#if hasOffers}
			<ul class="grid gap-3 md:grid-cols-2">
				{#each sponsorship.offers as offer (offer.id)}<OfferCard {offer} {now} />{/each}
			</ul>
		{:else}
			<p class="text-sm text-mist-400">None right now. Brands write when the water is worth their name — keep the reputation climbing and the water clear.</p>
		{/if}
	</div>
	<AboutToggle title="About sponsorship">
		A brand pays a lump sum, on signing, to put its name on the boards round the water for {SponsorshipTerm.MonthsPerTerm} months at a time, up to {LongestYears} years. Offers stay on the table for {OfferLife.ExpiresAfterFisheryDays} fishery days and at most {OfferLife.MostOpenAtOnce} are open at once; turn one down and wait for a better one if you like. One deal runs at a time.
	</AboutToggle>
</section>
