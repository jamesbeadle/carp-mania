<script lang="ts">
	import type { WorldActivity } from '$lib/contracts/WorldActivity';
	import { formatWhen } from '$lib/format/dates';
	import { feedLineFor } from '$lib/game/world/feedLine';

	interface Props {
		feed: WorldActivity[];
		onPick: (lakeId: string) => void;
	}

	let { feed, onPick }: Props = $props();

	const LinesShown = 6;

	const recent = $derived(feed.slice(0, LinesShown));
</script>

<section class="rounded-xl border border-carbon-700 bg-carbon-900/80 px-4 py-3">
	<p class="stat-label">Live</p>
	{#if recent.length === 0}
		<p class="text-sm text-mist-400">Quiet out there. Big catches, sales, records and new waters land here as they happen.</p>
	{:else}
		<ul class="divide-y divide-carbon-700/60 text-sm">
			{#each recent as activity (activity.id)}
				<li class="flex items-baseline gap-3 py-1">
					<button class="min-w-0 truncate text-left text-mist-100 transition hover:text-volt-300" onclick={() => onPick(activity.lakeId)}>{feedLineFor(activity)}</button>
					<span class="ml-auto text-xs whitespace-nowrap text-mist-400">{formatWhen(activity.createdAt)}</span>
				</li>
			{/each}
		</ul>
	{/if}
</section>
