<script lang="ts">
	import { dealerOfferFor, whyDealerRefuses } from '$lib/domain/market/dealer';
	import { guidePriceOf } from '$lib/domain/market/valuation';
	import type { Carp } from '$lib/domain/types';
	import { formatMoney } from '$lib/format/money';
	import { formatWeight } from '$lib/format/weight';
	import TransitBadge from '../carp/TransitBadge.svelte';

	let { fish }: { fish: Carp } = $props();

	const refusal = $derived(whyDealerRefuses(fish));
</script>

<li class="flex flex-wrap items-center gap-x-3 gap-y-1 py-2 text-sm">
	<a href="/carp/{fish.id}" class="font-medium text-mist-100 hover:underline">{fish.name}</a>
	<span class="text-volt-300">{formatWeight(fish.weight_lb)}</span>
	<TransitBadge carp={fish} />
	<span class="text-xs text-mist-400">guide {formatMoney(guidePriceOf(fish))}</span>
	<form method="POST" action="?/sellToDealer" class="ml-auto">
		<input type="hidden" name="carpId" value={fish.id} />
		<button class="button-secondary px-3 py-1 text-base" disabled={refusal !== null} title={refusal ?? `Sell ${fish.name} to the dealer`}>Sell for {formatMoney(dealerOfferFor(fish))}</button>
	</form>
	{#if refusal}
		<span class="w-full text-xs text-danger-400">{refusal}</span>
	{/if}
</li>
