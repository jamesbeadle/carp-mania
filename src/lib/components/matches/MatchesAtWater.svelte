<script lang="ts">
	import type { MatchCard } from '$lib/contracts/MatchCard';
	import MatchRow from './MatchRow.svelte';

	let { lakeId, matches, now }: { lakeId: string; matches: MatchCard[]; now: Date } = $props();
</script>

<section class="panel">
	<div class="mb-3 flex items-baseline gap-3">
		<h2 class="text-xl text-volt-300">Matches here</h2>
		<a href="/lakes/{lakeId}/host-a-match" class="ml-auto text-sm text-surge-400 hover:underline">Host a match →</a>
	</div>
	{#if matches.length === 0}
		<p class="text-sm text-mist-400">Nothing booked. Book the water out and set the pot.</p>
	{:else}
		<ol class="divide-y divide-carbon-700/60">
			{#each matches as card (card.match.id)}<MatchRow {card} {now} />{/each}
		</ol>
	{/if}
</section>
