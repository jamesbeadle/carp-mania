<script lang="ts">
	import { DealerTerms } from '$lib/domain/market/dealer';
	import { guidePriceOf } from '$lib/domain/market/valuation';
	import { ShoalBandWords, type Shoal } from '$lib/domain/stock/shoals';
	import { conditionTone } from '$lib/format/conditionTone';
	import { formatMoney } from '$lib/format/money';
	import { formatWeight } from '$lib/format/weight';
	import TransitBadge from '../carp/TransitBadge.svelte';

	let { shoal }: { shoal: Shoal } = $props();

	let count = $state(1);
	const isOnTheMove = $derived(shoal.transit_until !== null || shoal.quarantine_until !== null);
	const condition = $derived(Number(shoal.condition));
	const atLeastOne = $derived(Math.max(1, Math.floor(count)));
	const wanted = $derived(Math.min(atLeastOne, shoal.count));
	const guide = $derived(guidePriceOf({ weight_lb: Number(shoal.average_weight_lb), strain: 'common', condition: Number(shoal.condition), fame: 0 }));
	const offer = $derived(Math.round(guide * DealerTerms.BulkShare * wanted));
	const lowLb = $derived(Math.max(1, Number(shoal.average_weight_lb) - Number(shoal.weight_spread_lb)));
	const highLb = $derived(Number(shoal.average_weight_lb) + Number(shoal.weight_spread_lb));
</script>

<li class="flex flex-wrap items-center gap-x-3 gap-y-1 py-2 text-sm">
	<span class="font-medium text-mist-100">{shoal.count} × {ShoalBandWords[shoal.size_band]}</span>
	<span class="text-volt-300">{formatWeight(lowLb)}–{formatWeight(highLb)}</span>
	<span class="text-xs text-mist-400">{shoal.age_years} yrs · condition <span class={conditionTone(condition)}>{Math.round(condition)}%</span></span>
	<TransitBadge carp={shoal} />
	<form method="POST" action="?/sellShoalFish" class="ml-auto flex items-center gap-2">
		<input type="hidden" name="shoalId" value={shoal.id} />
		<input name="count" type="number" min="1" max={shoal.count} step="1" bind:value={count} class="field w-20 py-1 text-sm" disabled={isOnTheMove} aria-label="How many to sell" />
		<button class="button-secondary px-3 py-1 text-base" disabled={isOnTheMove}>Sell {wanted} for {formatMoney(offer)}</button>
	</form>
</li>
