<script lang="ts">
	import type { TackleShelves } from '$lib/contracts/TackleShelves';
	import { TierLabels } from '$lib/domain/tackle/brands';
	import { itemEffectsOf, itemWordsOf } from '$lib/domain/tackle/itemEffects';
	import { doesKindRunOut, UnitWords } from '$lib/domain/tackle/kinds';
	import { formatMoney } from '$lib/format/money';
	import { canAfford, canBuy, lockWordsFor, modelWordsOf, type ItemOnShelf } from '$lib/game/tackle/shopBrowsing';
	import BuyForm from './BuyForm.svelte';
	import DifferenceLine from './DifferenceLine.svelte';
	import EffectBars from './EffectBars.svelte';

	let { onShelf, counter }: { onShelf: ItemOnShelf; counter: TackleShelves } = $props();

	const { item, shelf, price } = $derived(onShelf);
	const effects = $derived(itemEffectsOf(item));
	const lockWords = $derived(lockWordsFor(shelf, counter));
	const packWords = $derived(doesKindRunOut(item.kind) ? `${item.packQuantity} ${UnitWords[item.kind]} a pack` : 'each');
	const owned = $derived(counter.ownedQuantities[item.id] ?? 0);
	const ownedWords = $derived(owned > 0 ? `You have ${Math.round(owned)}${doesKindRunOut(item.kind) ? ` ${UnitWords[item.kind]}` : ''}` : '');
	const isLocked = $derived(!canBuy(shelf));
</script>

<article class="flex flex-col gap-3 rounded-xl border bg-carbon-900/80 p-4" class:border-carbon-700={!isLocked} class:border-carbon-800={isLocked} class:opacity-75={isLocked}>
	<div class="flex items-start gap-2">
		<div class="min-w-0 flex-1">
			<p class="stat-label">{shelf.label} · {TierLabels[shelf.tier]}{shelf.isSponsored ? ' · sponsor price' : ''}</p>
			<h3 class="font-display text-lg leading-tight font-bold text-mist-100">{modelWordsOf(item, shelf)}</h3>
		</div>
		<p class="text-right"><span class="font-display text-2xl leading-none font-extrabold text-volt-300 italic tabular-nums">{formatMoney(price)}</span><br /><span class="text-xs text-mist-400">{packWords}</span></p>
	</div>
	{#if effects.length > 0}<EffectBars {effects} />{:else}<p class="text-xs text-mist-400">{itemWordsOf(item)}</p>{/if}
	<DifferenceLine {item} inUse={counter.inUse[item.kind]} />
	<div class="mt-auto flex flex-wrap items-center gap-x-3 gap-y-2">
		{#if ownedWords}<span class="text-xs text-mist-400">{ownedWords}</span>{/if}
		{#if lockWords}
			<span class="ml-auto rounded-full border border-carbon-600 px-2 py-0.5 text-xs text-warning-500">🔒 {lockWords}</span>
		{:else}
			<div class="ml-auto"><BuyForm {item} isAffordable={canAfford(shelf, price, counter.money)} /></div>
		{/if}
	</div>
</article>
