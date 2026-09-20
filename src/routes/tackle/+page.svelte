<script lang="ts">
	import PlaceBanner from '$lib/components/place/PlaceBanner.svelte';
	import OwnedList from '$lib/components/tackle/OwnedList.svelte';
	import SavedRodsList from '$lib/components/tackle/SavedRodsList.svelte';
	import { TackleKinds } from '$lib/domain/tackle/kinds';
	import { ownedItemsIn, ownedOfKind } from '$lib/domain/tackle/tackleBox';

	let { data } = $props();

	const box = $derived(ownedItemsIn(data.box.owned));
</script>

<svelte:head><title>My tackle box · Carp Mania</title></svelte:head>

<PlaceBanner kind="shop" title="My tackle box" blurb="What you own, by kind. Line, hooks, rigs, leads, tubing and bait run out; rods and reels last until one snaps. Your rating is {Math.round(data.box.rating)}.">
	{#snippet actions()}
		<a href="/market/tackle" class="button-primary text-base">The tackle counter</a>
	{/snippet}
</PlaceBanner>

<div class="grid gap-4 lg:grid-cols-2">
	<div class="lg:col-span-2"><SavedRodsList savedRods={data.box.savedRods} /></div>
	{#each TackleKinds as kind (kind)}
		<OwnedList {kind} owned={ownedOfKind(box, kind)} />
	{/each}
</div>
