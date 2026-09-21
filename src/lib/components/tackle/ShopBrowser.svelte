<script lang="ts">
	import type { TackleShelves } from '$lib/contracts/TackleShelves';
	import type { TackleKind } from '$lib/domain/tackle/kinds';
	import { EveryBrand, itemsOnShow, shelvesStocking, type BrandChoice } from '$lib/game/tackle/shopBrowsing';
	import BrandFilterRow from './BrandFilterRow.svelte';
	import KindTabs from './KindTabs.svelte';
	import ShopItemCard from './ShopItemCard.svelte';
	import ShopStory from './ShopStory.svelte';

	let { counter }: { counter: TackleShelves } = $props();

	const FirstKind: TackleKind = 'rod';
	let kind = $state<TackleKind>(FirstKind);
	let brand = $state<BrandChoice>(EveryBrand);

	const shelvesForKind = $derived(shelvesStocking(counter.shelves, kind));
	const brandOnShow = $derived(shelvesForKind.some((shelf) => shelf.brand === brand) ? brand : EveryBrand);
	const onShow = $derived(itemsOnShow(counter.shelves, kind, brandOnShow));
	const countOf = (ofKind: TackleKind) => itemsOnShow(counter.shelves, ofKind, EveryBrand).length;
	const chosenShelf = $derived(shelvesForKind.find((shelf) => shelf.brand === brandOnShow) ?? null);
</script>

<div class="space-y-4">
	<KindTabs chosen={kind} {countOf} onChoose={(next) => (kind = next)} />
	<BrandFilterRow shelves={shelvesForKind} chosen={brandOnShow} onChoose={(next) => (brand = next)} />
	{#if chosenShelf}<ShopStory shelf={chosenShelf} {counter} />{/if}
	<div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
		{#each onShow as onShelf (onShelf.item.id)}
			<ShopItemCard {onShelf} {counter} />
		{/each}
	</div>
</div>
