<script lang="ts">
	import type { CatchCard as Card } from '$lib/contracts/TrophyRoom';
	import CatchCard from './CatchCard.svelte';

	let { cards, isMine = false }: { cards: Card[]; isMine?: boolean } = $props();
</script>

<section>
	<h2 class="mb-3 text-2xl text-volt-300">{isMine ? 'My biggest fish' : 'The biggest fish'}</h2>
	{#if cards.length === 0}
		<p class="panel text-sm text-mist-400">{isMine ? 'Nothing on the mat yet. The first fish you land goes here.' : 'Nothing on the mat yet.'}</p>
	{:else}
		<ol class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
			{#each cards as card, index (card.catchId)}
				<li><CatchCard {card} place={index + 1} /></li>
			{/each}
		</ol>
	{/if}
</section>
