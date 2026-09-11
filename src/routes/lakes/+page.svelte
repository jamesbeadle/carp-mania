<script lang="ts">
	import LakeCard from '$lib/components/lakes/LakeCard.svelte';

	let { data } = $props();

	const favouriteIds = $derived(new Set(data.favouriteIds));
</script>

<div class="mb-6 flex flex-wrap items-end gap-4">
	<div>
		<h1 class="mb-2 text-4xl text-volt-300">Waters to fish</h1>
		<p class="text-mist-400">Every fishery in the game, best reputation first. Day tickets go to the owner.</p>
	</div>
	<a href="/world" class="button-secondary ml-auto">Spin the globe</a>
</div>

<div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
	{#each data.lakes as summary (summary.lake.id)}
		<LakeCard {summary} isFavourite={favouriteIds.has(summary.lake.id)} />
	{/each}
</div>
