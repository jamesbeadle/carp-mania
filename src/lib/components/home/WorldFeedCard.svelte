<script lang="ts">
	import type { WorldActivity } from '$lib/contracts/WorldActivity';
	import { formatWhen } from '$lib/format/dates';
	import { isAVisitorsCatch } from '$lib/domain/world/feedGroups';
	import { feedLineFor } from '$lib/game/world/feedLine';
	import { worldUrlForLake } from '$lib/game/world/worldUrl';

	let { feed }: { feed: WorldActivity[] } = $props();

	const headline = $derived(feed.length === 0 ? 'All quiet' : 'Out there right now');
</script>

<section class="panel">
	<p class="stat-label">The world</p>
	<h2 class="mb-4 text-3xl text-volt-300">{headline}</h2>
	{#if feed.length === 0}
		<p class="text-sm text-mist-400">Big catches, sales, records and new waters from every fishery in the game land here.</p>
	{:else}
		<ul class="divide-y divide-carbon-700/60 text-sm">
			{#each feed as activity (activity.id)}
				<li class={['flex items-baseline gap-3 py-2', isAVisitorsCatch(activity) && 'opacity-60']}>
					<a href={worldUrlForLake(activity.lakeId)} class="min-w-0 truncate text-mist-100 hover:underline">{feedLineFor(activity)}</a>
					<span class="ml-auto text-xs whitespace-nowrap text-mist-400">{formatWhen(activity.createdAt)}</span>
				</li>
			{/each}
		</ul>
	{/if}
	<div class="mt-5 flex gap-3">
		<a href="/world" class="button-secondary">Spin the globe</a>
	</div>
</section>
