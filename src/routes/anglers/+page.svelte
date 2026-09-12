<script lang="ts">
	import AnglerCard from '$lib/components/angler/AnglerCard.svelte';

	let { data } = $props();
</script>

<h1 class="mb-2 text-4xl text-volt-300">Anglers</h1>
<p class="mb-6 text-mist-400">The hundred best rods in the game, by overall skill. Open an angler for their personal bests, their famous fish and their water.</p>

{#if data.anglers.length === 0}
	<p class="text-sm text-mist-400">Nobody has signed in yet.</p>
{:else}
	<ol class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
		{#each data.anglers as angler, index (angler.id)}
			<li><AnglerCard {angler} rank={index + 1} /></li>
		{/each}
	</ol>
{/if}
