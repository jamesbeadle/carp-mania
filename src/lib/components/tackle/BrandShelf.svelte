<script lang="ts">
	import type { Shelf } from '$lib/contracts/TackleShelves';
	import { TierLabels } from '$lib/domain/tackle/brands';
	import { priceUnderSponsorship, SponsorshipTerms } from '$lib/domain/tackle/sponsorship';
	import { formatMoney } from '$lib/format/money';
	import ShelfItem from './ShelfItem.svelte';

	let { shelf, money }: { shelf: Shelf; money: number } = $props();

	let isOpen = $state(false);
	const lockWords = $derived(shelf.isUnlocked ? '' : ` · locked until rating ${shelf.minimumRating}`);
	const DiscountPercent = Math.round(SponsorshipTerms.Discount * 100);
	const sponsoredWords = $derived(shelf.isSponsored ? `Sponsored — the whole tier is open and everything is ${DiscountPercent}% off` : '');
	const creditWords = $derived(shelf.credit > 0 ? `${formatMoney(shelf.credit)} of brand credit to spend here` : '');
	const backingWords = $derived([sponsoredWords, creditWords].filter(Boolean).join(' · '));
	const priceOf = (price: number) => (shelf.isSponsored ? priceUnderSponsorship(price) : price);
	const canAfford = (price: number) => money + shelf.credit >= priceOf(price);
</script>

<section class="panel">
	<button class="flex w-full flex-wrap items-baseline gap-x-3 text-left" onclick={() => (isOpen = !isOpen)} aria-expanded={isOpen}>
		<h2 class="text-xl text-volt-300">{shelf.label}</h2>
		<span class="text-xs tracking-wide text-mist-400 uppercase">{TierLabels[shelf.tier]}{lockWords}</span>
		<span class="ml-auto text-xs text-mist-400">{shelf.items.length} lines · {isOpen ? 'hide' : 'show'}</span>
	</button>
	<p class="mt-1 text-sm text-mist-400">{shelf.story}</p>
	{#if backingWords}<p class="mt-1 text-sm text-warning-500">{backingWords}</p>{/if}
	{#if isOpen}
		<ul class="mt-3">
			{#each shelf.items as item (item.id)}
				<ShelfItem {item} price={priceOf(item.price)} isUnlocked={shelf.isUnlocked} canAfford={canAfford(item.price)} />
			{/each}
		</ul>
	{/if}
</section>
