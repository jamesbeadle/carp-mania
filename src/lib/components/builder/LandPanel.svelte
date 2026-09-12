<script lang="ts">
	import { landQuoteFor } from '$lib/domain/groundworks/landPurchase';
	import type { Lake } from '$lib/domain/types';
	import { RegionCatalogue } from '$lib/domain/world/regions';
	import { formatMoney } from '$lib/format/money';

	let { lake, hasEarthworksInProgress }: { lake: Lake; hasEarthworksInProgress: boolean } = $props();

	const quote = $derived(landQuoteFor(lake, hasEarthworksInProgress));
	const region = $derived(RegionCatalogue[lake.region]);
</script>

<form method="POST" action="?/buyLand" class="space-y-3 border-t border-carbon-700 pt-3">
	<dl class="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-sm">
		<dt class="stat-label">Plot now</dt>
		<dd class="text-right text-mist-100">{Number(lake.plot_acres)} acres</dd>
		<dt class="stat-label">After</dt>
		<dd class="text-right text-mist-100">{quote.plotAfter} acres</dd>
		<dt class="stat-label">Land here</dt>
		<dd class="text-right text-mist-100">{formatMoney(region.landPricePerAcre)} an acre</dd>
	</dl>
	<p class="text-xs text-mist-400">The water keeps its size; the bank around it grows, so the shoreline has room to move.</p>
	{#if quote.refusal}<p class="text-sm text-danger-400">{quote.refusal}</p>{/if}
	<button class="button-primary w-full px-2 text-base" disabled={quote.refusal !== null}>Buy {quote.acres} acres {formatMoney(quote.cost)}</button>
</form>
