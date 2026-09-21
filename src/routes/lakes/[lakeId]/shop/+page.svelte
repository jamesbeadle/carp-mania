<script lang="ts">
	import ActionMessage from '$lib/components/ActionMessage.svelte';
	import PlaceBanner from '$lib/components/place/PlaceBanner.svelte';
	import ShopBrowser from '$lib/components/tackle/ShopBrowser.svelte';
	import { TierLabels } from '$lib/domain/tackle/brands';
	import { formatMoney } from '$lib/format/money';

	let { data, form } = $props();

	const shelves = $derived(data.shelves);
</script>

<svelte:head><title>The shop at {data.lake.name} · Carp Mania</title></svelte:head>

<PlaceBanner kind="shop" title="The shop at {data.lake.name}" blurb="This water's own counter stocks up to the {TierLabels[shelves.stocksUpTo]} tier. Your rating is {Math.round(shelves.rating)}; you have {formatMoney(shelves.money)}.">
	{#snippet actions()}
		<a href="/lakes/{data.lake.id}" class="button-secondary text-base">Back to the water</a>
		<a href="/tackle" class="button-secondary text-base">My tackle box</a>
	{/snippet}
</PlaceBanner>
<ActionMessage {form} />

<ShopBrowser counter={shelves} />
