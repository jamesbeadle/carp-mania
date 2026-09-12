<script lang="ts">
	import LakeCard from '$lib/components/lakes/LakeCard.svelte';
	import WaterFilterBar from '$lib/components/lakes/WaterFilterBar.svelte';
	import Pager from '$lib/components/lists/Pager.svelte';
	import PlaceBanner from '$lib/components/place/PlaceBanner.svelte';
	import { listPathFor } from '$lib/domain/lists/listPath';
	import { waterParamsOf } from '$lib/domain/lists/waterFilters';

	let { data } = $props();

	const WatersPath = '/lakes';
	const favouriteIds = $derived(new Set(data.favouriteIds));
	const list = $derived(data.watersToFish);
	const hrefFor = (page: number) => listPathFor(WatersPath, waterParamsOf(list.filters), page);
</script>

<svelte:head><title>Waters to fish · Carp Mania</title></svelte:head>

<PlaceBanner kind="jetty" title="Waters to fish" blurb="Every open fishery in the game. Day tickets go to the owner.">
	{#snippet actions()}
		<a href="/matches" class="button-secondary text-base">Matches</a>
		<a href="/world" class="button-secondary text-base">Spin the globe</a>
	{/snippet}
</PlaceBanner>

<WaterFilterBar filters={list.filters} />

{#if list.page.items.length === 0}
	<section class="panel text-center"><p class="text-mist-200">No water matches that. Try another name or region.</p></section>
{:else}
	<div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
		{#each list.page.items as summary (summary.lake.id)}
			<LakeCard {summary} isFavourite={favouriteIds.has(summary.lake.id)} />
		{/each}
	</div>
{/if}

<Pager page={list.page} noun="water" {hrefFor} />
