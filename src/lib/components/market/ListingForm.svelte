<script lang="ts">
	import { commissionOn, ListingTerms, listingFeeFor, sellerReceives, whyCarpCannotBeListed, type ListingKind } from '$lib/domain/market/listingRules';
	import { guidePriceOf } from '$lib/domain/market/valuation';
	import type { Carp } from '$lib/domain/types';
	import { formatMoney } from '$lib/format/money';
	import { formatWeight } from '$lib/format/weight';
	import { untrack } from 'svelte';

	let { carp, listedCarpIds, chosenCarpId = null }: { carp: Carp[]; listedCarpIds: string[]; chosenCarpId?: string | null } = $props();

	const DefaultDurationHours = 24;
	const feePercent = Math.round(ListingTerms.FeeShareOfStartingPrice * 100);
	const commissionPercent = Math.round(ListingTerms.CommissionShare * 100);

	const listable = $derived(carp.filter((fish) => whyCarpCannotBeListed(fish) === null && !listedCarpIds.includes(fish.id)));
	let carpId = $state(untrack(() => chosenCarpId) ?? '');
	let kind = $state<ListingKind>('auction');
	let startingPrice = $state(0);
	let durationHours = $state<number>(DefaultDurationHours);
	const chosen = $derived(listable.find((fish) => fish.id === carpId) ?? null);
	const isAuction = $derived(kind === 'auction');
	const fee = $derived(listingFeeFor(startingPrice));
	const commission = $derived(commissionOn(startingPrice));

	$effect(() => {
		startingPrice = chosen ? guidePriceOf(chosen) : 0;
	});
</script>

<section class="panel">
	<h3 class="mb-1 text-xl text-volt-300">List a fish for sale</h3>
	<p class="mb-4 text-sm text-mist-400">
		Catalogued fish in condition {ListingTerms.MinimumConditionToList} or better, not in transit or quarantine. The fee is {feePercent}% of the starting price (at least
		{formatMoney(ListingTerms.MinimumFee)}), paid now and never refunded; {commissionPercent}% commission comes off when it sells. The fish keeps swimming here until it does.
	</p>
	{#if listable.length === 0}
		<p class="text-sm text-mist-400">Nothing you can list right now.</p>
	{:else}
		<form method="POST" action="?/listForSale" class="grid gap-3 sm:grid-cols-2">
			<label class="text-xs text-mist-400 sm:col-span-2">
				Fish
				<select name="carpId" bind:value={carpId} class="field mt-1">
					<option value="">Choose a fish</option>
					{#each listable as fish (fish.id)}
						<option value={fish.id}>{fish.name} · {formatWeight(fish.weight_lb)} · guide {formatMoney(guidePriceOf(fish))}</option>
					{/each}
				</select>
			</label>
			<fieldset class="flex gap-4 text-sm text-mist-200 sm:col-span-2">
				<label><input type="radio" name="kind" value="auction" bind:group={kind} /> Auction</label>
				<label><input type="radio" name="kind" value="buy_now" bind:group={kind} /> Buy now</label>
			</fieldset>
			<label class="text-xs text-mist-400">
				{isAuction ? 'Starting price' : 'Price'}
				<input name="startingPrice" type="number" min={ListingTerms.MinimumStartingPrice} step="1" bind:value={startingPrice} class="field mt-1" />
			</label>
			{#if isAuction}
				<label class="text-xs text-mist-400">Reserve (optional)<input name="reservePrice" type="number" min={startingPrice} step="1" class="field mt-1" /></label>
				<label class="text-xs text-mist-400">Buy-now price (optional)<input name="buyNowPrice" type="number" min={startingPrice} step="1" class="field mt-1" /></label>
				<label class="text-xs text-mist-400">
					Runs for
					<select name="durationHours" bind:value={durationHours} class="field mt-1">
						{#each ListingTerms.AuctionHours as hours (hours)}<option value={hours}>{hours} hours</option>{/each}
					</select>
				</label>
			{:else}
				<p class="self-end text-xs text-mist-400">Stays up for {ListingTerms.BuyNowDays} days or until someone buys it.</p>
			{/if}
			<div class="flex flex-wrap items-center gap-3 sm:col-span-2">
				<span class="text-sm text-mist-400">
					Fee {formatMoney(fee)} now · commission {formatMoney(commission)} at {formatMoney(startingPrice)} · you'd receive {formatMoney(sellerReceives(startingPrice))}
				</span>
				<button class="button-primary ml-auto" disabled={!chosen}>List for sale · pay {formatMoney(fee)}</button>
			</div>
		</form>
	{/if}
</section>
