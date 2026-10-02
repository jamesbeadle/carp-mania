<script lang="ts">
	import type { BadgeOnTheDesk } from '$lib/contracts/Badges';
	import BadgePin from './BadgePin.svelte';
	import BadgeWearerRow from './BadgeWearerRow.svelte';

	let { badge }: { badge: BadgeOnTheDesk } = $props();

	const hasWearers = $derived(badge.wearers.length > 0);
</script>

<li class="flex gap-4 rounded-xl border border-carbon-700 p-3">
	<BadgePin name={badge.name} metal={badge.metal} isLarge />
	<div class="min-w-0 flex-1">
		<p class="font-display text-lg font-bold tracking-wide text-volt-300 uppercase">{badge.name}</p>
		<p class="text-sm text-mist-300">{badge.words}</p>
		{#if !hasWearers}
			<p class="mt-2 text-xs text-mist-400">Nobody wears it yet.</p>
		{:else}
			<ul class="mt-2 divide-y divide-carbon-700/60 text-sm">
				{#each badge.wearers as wearer (wearer.anglerId)}
					<BadgeWearerRow {wearer} />
				{/each}
			</ul>
		{/if}
	</div>
</li>
