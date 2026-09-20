<script lang="ts">
	import ActionMessage from '$lib/components/ActionMessage.svelte';
	import FarmCard from '$lib/components/market/FarmCard.svelte';
	import PlaceBanner from '$lib/components/place/PlaceBanner.svelte';
	import { formatMoney } from '$lib/format/money';

	let { data, form } = $props();

	const shelves = $derived(data.shelves);
	const waterWords = $derived(shelves.waterName ? `Delivering to ${shelves.waterName}` : 'Buy a water before the farms will deliver');
	const roomWords = $derived(shelves.roomLeftLb === null ? '' : ` · room for about ${shelves.roomLeftLb} lb more`);
</script>

<svelte:head><title>The farms · Carp Mania</title></svelte:head>

<PlaceBanner kind="yard" title="The farms" blurb="{waterWords}{roomWords} · {formatMoney(shelves.money)} to spend">
	{#snippet actions()}
		<a href="/lake" class="button-secondary text-base">The lodge</a>
		<a href="/market" class="button-secondary text-base">The tackle shop</a>
	{/snippet}
</PlaceBanner>
<ActionMessage {form} />

<div class="grid gap-4 lg:grid-cols-2">
	{#each shelves.farms as shelf (shelf.farm.id)}
		<FarmCard {shelf} money={shelves.money} />
	{/each}
</div>
