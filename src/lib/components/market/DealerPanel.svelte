<script lang="ts">
	import { DealerTerms } from '$lib/domain/market/dealer';
	import type { Carp } from '$lib/domain/types';
	import DealerRow from './DealerRow.svelte';

	let { carp, limit = 15 }: { carp: Carp[]; limit?: number } = $props();

	let isShowingAll = $state(false);
	const visibleCarp = $derived(isShowingAll ? carp : carp.slice(0, limit));
	const dealerSharePercent = Math.round(DealerTerms.ShareOfGuidePrice * 100);
</script>

<section class="panel">
	<h3 class="mb-1 text-xl text-volt-300">The dealer</h3>
	<p class="mb-4 text-sm text-mist-400">
		Buys any catalogued fish on the spot at {dealerSharePercent}% of guide — condition {DealerTerms.MinimumCondition} or better, up to
		{DealerTerms.SalesPerLakePerFisheryDay} fish a fishery day. The floor under every price, and the way out if you've overstocked.
	</p>
	{#if carp.length === 0}
		<p class="text-sm text-mist-400">Nothing to sell yet.</p>
	{:else}
		<ul class="divide-y divide-carbon-700/60">
			{#each visibleCarp as fish (fish.id)}
				<DealerRow {fish} />
			{/each}
		</ul>
	{/if}
	{#if carp.length > limit}
		<button class="mt-3 text-sm text-volt-300 hover:underline" onclick={() => (isShowingAll = !isShowingAll)}>
			{isShowingAll ? 'Show fewer' : `Show all ${carp.length} fish`}
		</button>
	{/if}
</section>
