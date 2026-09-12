<script lang="ts">
	import type { WorldActivity } from '$lib/contracts/WorldActivity';
	import { FeedGroups, oldestOf, type FeedGroup } from '$lib/domain/world/feedGroups';
	import { formatWhen } from '$lib/format/dates';
	import { feedLineFor } from '$lib/game/world/feedLine';
	import { FeedView } from '$lib/game/world/feedView.svelte';
	import FeedGroupPills from './FeedGroupPills.svelte';

	interface Props {
		feed: WorldActivity[];
		onPick: (lakeId: string) => void;
		onLoadOlder: (before: string, group: FeedGroup | null) => Promise<WorldActivity[]>;
	}

	let { feed, onPick, onLoadOlder }: Props = $props();

	const view = new FeedView();
	const lines = $derived(view.linesOf(feed));
	const hasMoreLoaded = $derived(view.hasMoreLoaded(feed));
	const canGoOlder = $derived(hasMoreLoaded || (!view.isExhausted && feed.length > 0));
	const olderWord = $derived(view.isLoading ? 'Looking back…' : 'Older');

	async function older() {
		if (hasMoreLoaded) return view.showMore();
		const oldest = oldestOf(feed);
		if (!oldest || view.isLoading) return;
		view.isLoading = true;
		const found = await onLoadOlder(oldest.createdAt, view.group);
		view.receivedOlder(found.length);
		view.isLoading = false;
	}
</script>

<section class="rounded-xl border border-carbon-700 bg-carbon-900/80 px-4 py-3">
	<div class="flex flex-wrap items-center gap-x-3 gap-y-2">
		<p class="stat-label">Live</p>
		<FeedGroupPills groups={FeedGroups} chosen={view.group} onChoose={(group) => view.choose(group)} />
	</div>
	{#if lines.length === 0}
		<p class="mt-2 text-sm text-mist-400">{view.group === null ? 'Quiet out there. Big catches, sales, records and new waters land here as they happen.' : 'Nothing of that kind lately.'}</p>
	{:else}
		<ul class="mt-1 divide-y divide-carbon-700/60 text-sm">
			{#each lines as activity (activity.id)}
				<li class="flex items-baseline gap-3 py-1">
					<button class="min-w-0 truncate text-left text-mist-100 transition hover:text-volt-300" onclick={() => onPick(activity.lakeId)}>{feedLineFor(activity)}</button>
					<span class="ml-auto text-xs whitespace-nowrap text-mist-400">{formatWhen(activity.createdAt)}</span>
				</li>
			{/each}
		</ul>
	{/if}
	{#if canGoOlder}
		<button class="mt-2 text-sm text-surge-400 hover:underline disabled:opacity-60" onclick={older} disabled={view.isLoading}>{olderWord}</button>
	{:else if lines.length > 0}
		<p class="mt-2 text-xs text-mist-400">That is everything the world remembers.</p>
	{/if}
</section>
