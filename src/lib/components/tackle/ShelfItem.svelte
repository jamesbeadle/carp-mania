<script lang="ts">
	import { doesKindRunOut, UnitWords } from '$lib/domain/tackle/kinds';
	import type { TackleItem } from '$lib/domain/tackle/tackleItem';
	import { formatMoney } from '$lib/format/money';
	import { statsWordsFor } from './itemWords';

	let { item, isUnlocked, canAfford }: { item: TackleItem; isUnlocked: boolean; canAfford: boolean } = $props();

	const packWords = $derived(doesKindRunOut(item.kind) ? `${item.packQuantity} ${UnitWords[item.kind]} a pack` : 'each');
	const OnePack = 1;
</script>

<li class="flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-carbon-700 py-2 text-sm first:border-t-0">
	<div class="min-w-0 flex-1">
		<p class="font-medium text-mist-100">{item.label}</p>
		<p class="text-xs text-mist-400">{statsWordsFor(item)}</p>
	</div>
	<span class="text-volt-300">{formatMoney(item.price)} <span class="text-xs text-mist-400">{packWords}</span></span>
	{#if !isUnlocked}
		<span class="rounded-full border border-carbon-600 px-2 py-0.5 text-xs text-mist-400">Rating {item.minimumRating}</span>
	{:else}
		<form method="POST" action="?/buy" class="flex items-center gap-2">
			<input type="hidden" name="itemId" value={item.id} />
			{#if doesKindRunOut(item.kind)}<input name="packs" type="number" min="1" max="20" value={OnePack} class="field w-16" aria-label="How many packs" />{:else}<input type="hidden" name="packs" value={OnePack} />{/if}
			<button class="button-primary px-3 py-1 text-sm" disabled={!canAfford}>Buy</button>
		</form>
	{/if}
</li>
