<script lang="ts">
	import ActionMessage from '$lib/components/ActionMessage.svelte';
	import PlaceBanner from '$lib/components/place/PlaceBanner.svelte';
	import BrandShelf from '$lib/components/tackle/BrandShelf.svelte';
	import { TierLabels } from '$lib/domain/tackle/brands';
	import { formatMoney } from '$lib/format/money';

	let { data, form } = $props();

	const shelves = $derived(data.shelves);
</script>

<svelte:head><title>The tackle shop · Carp Mania</title></svelte:head>

<PlaceBanner kind="shop" title="The tackle shop" blurb="Rods, reels, line, hooks, rigs, leads, tubing and bait, by brand. This counter stocks up to the {TierLabels[shelves.stocksUpTo]} tier; Custom-tier kit is only sold at a water whose shop has earned it. Your rating is {Math.round(shelves.rating)}; you have {formatMoney(shelves.money)}.">
	{#snippet actions()}
		<a href="/tackle" class="button-secondary text-base">My tackle box</a>
		<a href="/market/farms" class="button-secondary text-base">The farms</a>
	{/snippet}
</PlaceBanner>
<ActionMessage {form} />

<div class="space-y-4">
	{#each shelves.shelves as shelf (shelf.brand)}
		<BrandShelf {shelf} money={shelves.money} />
	{/each}
</div>
