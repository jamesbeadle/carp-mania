<script lang="ts">
	import LakeCard from '$lib/components/lakes/LakeCard.svelte';

	let { data } = $props();
</script>

<h1 class="mb-2 text-4xl text-gold-300">Waters to fish</h1>
<p class="mb-6 text-mist-400">Every fishery in the game, best reputation first. Day tickets go to the owner.</p>

<div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
	{#each data.lakes as summary (summary.lake.id)}
		<LakeCard {summary} />
	{/each}
</div>
