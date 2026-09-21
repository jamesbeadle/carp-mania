<script lang="ts">
	import PlaceBanner from '$lib/components/place/PlaceBanner.svelte';
	import OwnedList from '$lib/components/tackle/OwnedList.svelte';
	import SavedRodsList from '$lib/components/tackle/SavedRodsList.svelte';
	import { TackleKinds, type TackleKind } from '$lib/domain/tackle/kinds';
	import { ownedItemsIn } from '$lib/domain/tackle/tackleBox';

	let { data } = $props();

	const box = $derived(ownedItemsIn(data.box.owned));
	const ownedOrSpoiled = (kind: TackleKind) => box.filter((line) => line.item.kind === kind && line.quantity > 0);
</script>

<svelte:head><title>My tackle box · Carp Mania</title></svelte:head>

<PlaceBanner kind="shop" title="My tackle box" blurb="What you own, by kind · your rating {Math.round(data.box.rating)}">
	{#snippet actions()}
		<a href="/market" class="button-primary text-base">The tackle counter</a>
	{/snippet}
</PlaceBanner>

<div class="grid gap-4 lg:grid-cols-2">
	<div class="lg:col-span-2"><SavedRodsList savedRods={data.box.savedRods} rodSets={data.box.rodSets} /></div>
	{#each TackleKinds as kind (kind)}
		<OwnedList {kind} owned={ownedOrSpoiled(kind)} />
	{/each}
</div>
