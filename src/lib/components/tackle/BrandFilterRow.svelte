<script lang="ts">
	import type { Shelf } from '$lib/contracts/TackleShelves';
	import { TierLabels } from '$lib/domain/tackle/brands';
	import { canBuy, EveryBrand, type BrandChoice } from '$lib/game/tackle/shopBrowsing';

	let { shelves, chosen, onChoose }: { shelves: Shelf[]; chosen: BrandChoice; onChoose: (brand: BrandChoice) => void } = $props();

	const titleOf = (shelf: Shelf) => `${shelf.story}${canBuy(shelf) ? '' : ` · locked until rating ${shelf.minimumRating}`}`;
</script>

<div class="flex flex-wrap gap-1.5" role="group" aria-label="Brand">
	<button type="button" class="rounded-full border px-3 py-1 text-xs transition" class:border-volt-500={chosen === EveryBrand} class:text-volt-300={chosen === EveryBrand} class:border-carbon-600={chosen !== EveryBrand} class:text-mist-200={chosen !== EveryBrand} aria-pressed={chosen === EveryBrand} onclick={() => onChoose(EveryBrand)}>Every brand</button>
	{#each shelves as shelf (shelf.brand)}
		{@const isChosen = chosen === shelf.brand}
		{@const isLocked = !canBuy(shelf)}
		<button type="button" class="rounded-full border px-3 py-1 text-xs transition" class:border-volt-500={isChosen} class:text-volt-300={isChosen} class:border-carbon-600={!isChosen} class:text-mist-200={!isChosen && !isLocked} class:text-mist-400={!isChosen && isLocked} aria-pressed={isChosen} title={titleOf(shelf)} onclick={() => onChoose(shelf.brand)}>
			{isLocked ? '🔒 ' : ''}{shelf.label} <span class="opacity-60">{TierLabels[shelf.tier]}{isLocked ? ` · ${shelf.minimumRating}` : ''}</span>
		</button>
	{/each}
</div>
