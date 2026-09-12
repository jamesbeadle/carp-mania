<script lang="ts">
	import LakeCard from '$lib/components/lakes/LakeCard.svelte';
	import PlaceBanner from '$lib/components/place/PlaceBanner.svelte';

	let { data } = $props();

	const favouriteIds = $derived(new Set(data.favouriteIds));
</script>

<svelte:head><title>Waters to fish · Carp Mania</title></svelte:head>

<PlaceBanner kind="jetty" title="Waters to fish" blurb="Every fishery in the game, best reputation first. Day tickets go to the owner.">
	{#snippet actions()}
		<a href="/matches" class="button-secondary text-base">Matches</a>
		<a href="/world" class="button-secondary text-base">Spin the globe</a>
	{/snippet}
</PlaceBanner>

<div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
	{#each data.lakes as summary (summary.lake.id)}
		<LakeCard {summary} isFavourite={favouriteIds.has(summary.lake.id)} />
	{/each}
</div>
