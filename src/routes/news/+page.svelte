<script lang="ts">
	import { untrack } from 'svelte';
	import { goto } from '$app/navigation';
	import PlaceBanner from '$lib/components/place/PlaceBanner.svelte';
	import LiveFeed from '$lib/components/world/LiveFeed.svelte';
	import BiggestFishPanel from '$lib/components/world/BiggestFishPanel.svelte';
	import type { WorldActivity } from '$lib/contracts/WorldActivity';
	import { olderFeedPathFor, type FeedGroup } from '$lib/domain/world/feedGroups';
	import { LiveWorld } from '$lib/game/world/liveWorld.svelte';
	import { subscribeToWorldEvents } from '$lib/game/world/realtimeFeed';
	import { worldUrlForLake } from '$lib/game/world/worldUrl';
	import { createBrowserSupabase } from '$lib/supabase/createBrowserSupabase';

	let { data } = $props();

	const live = new LiveWorld(untrack(() => data.feed));

	$effect(() => subscribeToWorldEvents(createBrowserSupabase(), (event) => live.receive(event)));

	async function loadOlder(before: string, group: FeedGroup | null): Promise<WorldActivity[]> {
		const response = await fetch(olderFeedPathFor(before, group));
		const older = response.ok ? ((await response.json()) as WorldActivity[]) : [];
		live.remember(older);
		return older;
	}
</script>

<svelte:head><title>News · Carp Mania</title></svelte:head>

<PlaceBanner kind="signpost" title="News" blurb="Every water in the game, as it happens · tap a line to see it on the globe">
	{#snippet actions()}
		<a href="/world" class="button-secondary text-base">Spin the globe</a>
		<a href="/world/hall-of-fame" class="button-secondary text-base">Hall of fame</a>
		<a href="/anglers" class="button-secondary text-base">Anglers</a>
	{/snippet}
</PlaceBanner>

<div class="mx-auto max-w-3xl space-y-6">
	<BiggestFishPanel biggestFish={data.biggestFish} />
	<LiveFeed feed={live.feed} onPick={(lakeId) => goto(worldUrlForLake(lakeId))} onLoadOlder={loadOlder} />
</div>
