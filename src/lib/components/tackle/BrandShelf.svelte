<script lang="ts">
	import type { Shelf } from '$lib/contracts/TackleShelves';
	import { TierLabels } from '$lib/domain/tackle/brands';
	import ShelfItem from './ShelfItem.svelte';

	let { shelf, money }: { shelf: Shelf; money: number } = $props();

	let isOpen = $state(false);
	const lockWords = $derived(shelf.isUnlocked ? '' : ` · locked until rating ${shelf.minimumRating}`);
</script>

<section class="panel">
	<button class="flex w-full flex-wrap items-baseline gap-x-3 text-left" onclick={() => (isOpen = !isOpen)} aria-expanded={isOpen}>
		<h2 class="text-xl text-volt-300">{shelf.label}</h2>
		<span class="text-xs tracking-wide text-mist-400 uppercase">{TierLabels[shelf.tier]}{lockWords}</span>
		<span class="ml-auto text-xs text-mist-400">{shelf.items.length} lines · {isOpen ? 'hide' : 'show'}</span>
	</button>
	<p class="mt-1 text-sm text-mist-400">{shelf.story}</p>
	{#if isOpen}
		<ul class="mt-3">
			{#each shelf.items as item (item.id)}
				<ShelfItem {item} isUnlocked={shelf.isUnlocked} canAfford={money >= item.price} />
			{/each}
		</ul>
	{/if}
</section>
