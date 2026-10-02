<script lang="ts">
	import type { BadgeHeld } from '$lib/contracts/Badges';
	import BadgeHeldCard from './BadgeHeldCard.svelte';

	let { badges, isMine = false, isKeeper = false }: { badges: BadgeHeld[]; isMine?: boolean; isKeeper?: boolean } = $props();

	const nothingYet = $derived(isMine ? 'None yet. The keeper pins these on for whatever catches their eye.' : 'None pinned on.');
</script>

<section class="panel">
	<div class="mb-3 flex items-end gap-3">
		<div>
			<h2 class="text-xl text-volt-300">Badges</h2>
			<p class="text-xs text-mist-400">{badges.length} pinned on by the keeper.</p>
		</div>
		{#if isKeeper}<a href="/admin/badges" class="ml-auto text-sm text-surge-400 hover:underline">The badge desk →</a>{/if}
	</div>
	{#if badges.length === 0}
		<p class="text-sm text-mist-400">{nothingYet}</p>
	{:else}
		<ul class="grid gap-2 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
			{#each badges as badge (badge.badgeId)}
				<BadgeHeldCard {badge} />
			{/each}
		</ul>
	{/if}
</section>
