<script lang="ts">
	import type { BadgeOnTheDesk } from '$lib/contracts/Badges';
	import BadgeDeskCard from './BadgeDeskCard.svelte';

	let { badges }: { badges: BadgeOnTheDesk[] } = $props();
</script>

{#if badges.length === 0}
	<p class="text-sm text-mist-400">No badges struck yet. The first one is on the left.</p>
{:else}
	<ul class="space-y-4">
		{#each badges as badge (badge.id)}
			<BadgeDeskCard {badge} />
		{/each}
	</ul>
{/if}
