<script lang="ts">
	import { DealerTerms, dealerOffersFor, whyDealerRefuses } from '$lib/domain/market/dealer';
	import { destinationsFor } from '$lib/domain/market/estateMove';
	import type { Carp, Lake } from '$lib/domain/types';
	import { formatMoney } from '$lib/format/money';

	interface Props {
		chosen: Carp[];
		lake: Lake;
		waters: Lake[];
	}

	let { chosen, lake, waters }: Props = $props();

	const fullSharePercent = Math.round(DealerTerms.ShareOfGuidePrice * 100);
	const bulkSharePercent = Math.round(DealerTerms.BulkShare * 100);
	const dealerRefusal = $derived(chosen.map(whyDealerRefuses).find((reason) => reason !== null) ?? null);
	const dealerOffer = $derived(dealerOffersFor(chosen, 0));
	const destinations = $derived(destinationsFor(waters, lake.id));
	const hasChosen = $derived(chosen.length > 0);
	const fishWord = $derived(chosen.length === 1 ? chosen[0].name : `${chosen.length} fish`);
</script>

<div class="mt-4 rounded-xl border border-carbon-700/60 bg-carbon-900/60 p-4">
	<p class="mb-3 text-sm text-mist-400">
		{#if hasChosen}{fishWord} chosen.{:else}Tick fish to sell or move them together.{/if}
		The dealer pays {fullSharePercent}% of guide on the first {DealerTerms.FullShareFishPerFisheryDay} fish a fishery day and {bulkSharePercent}% after — a truckload gets a truckload price.
	</p>
	<div class="flex flex-wrap items-center gap-3">
		<form method="POST" action="?/sellToDealer">
			{#each chosen as fish (fish.id)}<input type="hidden" name="carpId" value={fish.id} />{/each}
			<button class="button-secondary px-3 py-1 text-base" disabled={!hasChosen || dealerRefusal !== null} title={dealerRefusal ?? `Sell ${fishWord} to the dealer`}>
				Sell to the dealer{#if hasChosen} for about {formatMoney(dealerOffer)}{/if}
			</button>
		</form>
		{#if destinations.length > 0}
			<form method="POST" action="?/moveToMyWater" class="flex max-w-full flex-wrap items-center gap-2">
				{#each chosen as fish (fish.id)}<input type="hidden" name="carpId" value={fish.id} />{/each}
				<select name="destinationId" class="field min-w-0 flex-1 py-1 text-sm">
					{#each destinations as water (water.id)}<option value={water.id}>{water.name}</option>{/each}
				</select>
				<button class="button-secondary px-3 py-1 text-base whitespace-nowrap" disabled={!hasChosen}>Move there</button>
			</form>
		{/if}
	</div>
	{#if dealerRefusal}
		<p class="mt-2 text-xs text-danger-400">{dealerRefusal}</p>
	{/if}
</div>
