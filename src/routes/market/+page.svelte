<script lang="ts">
	import ActionMessage from '$lib/components/ActionMessage.svelte';
	import PlaceBanner from '$lib/components/place/PlaceBanner.svelte';
	import ShopBrowser from '$lib/components/tackle/ShopBrowser.svelte';
	import { TierLabels } from '$lib/domain/tackle/brands';
	import { formatMoney } from '$lib/format/money';

	let { data, form } = $props();

	const shelves = $derived(data.shelves);
</script>

<svelte:head><title>The tackle shop · Carp Mania</title></svelte:head>

<PlaceBanner kind="shop" title="The tackle shop" blurb="Rods to bait, every brand in the game · this counter sells up to the {TierLabels[shelves.stocksUpTo]} tier · your rating {Math.round(shelves.rating)} · {formatMoney(shelves.money)} to spend">
	{#snippet actions()}
		<a href="/tackle" class="button-secondary text-base">My tackle box</a>
		<a href="/market/farms" class="button-secondary text-base">The farms</a>
	{/snippet}
</PlaceBanner>
<ActionMessage {form} />

<ShopBrowser counter={shelves} />
