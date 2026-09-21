<script lang="ts">
	import type { Shelf, TackleShelves } from '$lib/contracts/TackleShelves';
	import { SponsorshipTerms } from '$lib/domain/tackle/sponsorship';
	import { formatMoney } from '$lib/format/money';
	import { lockWordsFor } from '$lib/game/tackle/shopBrowsing';

	let { shelf, counter }: { shelf: Shelf; counter: TackleShelves } = $props();

	const DiscountPercent = Math.round(SponsorshipTerms.Discount * 100);
	const lockWords = $derived(lockWordsFor(shelf, counter));
	const sponsoredWords = $derived(shelf.isSponsored ? `Sponsored — the whole tier is open to you and everything is ${DiscountPercent}% off.` : '');
	const creditWords = $derived(shelf.credit > 0 ? `${formatMoney(shelf.credit)} of brand credit to spend here.` : '');
	const backingWords = $derived([sponsoredWords, creditWords].filter(Boolean).join(' '));
</script>

<p class="text-sm text-mist-300"><span class="font-medium text-mist-100">{shelf.label}.</span> {shelf.story}{#if backingWords} <span class="text-warning-500">{backingWords}</span>{/if}{#if lockWords} <span class="text-warning-500">🔒 {lockWords}</span>{/if}</p>
