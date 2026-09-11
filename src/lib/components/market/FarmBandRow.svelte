<script lang="ts">
	import type { FarmBandStock } from '$lib/contracts/FishFarmStock';
	import { formatMoney } from '$lib/format/money';

	let { band, count = $bindable(0) }: { band: FarmBandStock; count: number } = $props();

	const isSoldOut = $derived(band.left === 0);
</script>

<li class="flex flex-wrap items-center gap-x-3 gap-y-1 py-2 text-sm">
	<span class="w-28 font-medium text-mist-100">{band.label}</span>
	<span class="text-volt-300">{formatMoney(band.pricePerFish)} <span class="text-xs text-mist-400">a fish</span></span>
	<span class="text-xs" class:text-mist-400={!isSoldOut} class:text-danger-400={isSoldOut}>{isSoldOut ? 'sold out this week' : `${band.left} of ${band.weeklySupply} left this week`}</span>
	<input name={band.key} type="number" min="0" max={band.left} bind:value={count} disabled={isSoldOut} class="field ml-auto w-20" aria-label="How many {band.label}" />
</li>
