<script lang="ts">
	import type { AnglerRanks } from '$lib/contracts/TrophyRoom';

	let { ranks }: { ranks: AnglerRanks } = $props();

	const hasABest = $derived(ranks.bestLb > 0);
</script>

<p class="text-sm text-mist-400">
	{#if hasABest}<span class="text-volt-300">No. {ranks.bestRank}</span> of {ranks.anglers} anglers by personal best ·{:else}Unranked by personal best — nothing landed yet ·{/if}
	<span class="text-volt-300">No. {ranks.skillRank}</span> by skill
</p>
