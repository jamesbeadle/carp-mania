<script lang="ts">
	import { untrack } from 'svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import PlaceBanner from '$lib/components/place/PlaceBanner.svelte';
	import Leaderboards from '$lib/components/world/Leaderboards.svelte';
	import LiveFeed from '$lib/components/world/LiveFeed.svelte';
	import MatchingWaters from '$lib/components/world/MatchingWaters.svelte';
	import WorldHero from '$lib/components/world/WorldHero.svelte';
	import WorldToolbar from '$lib/components/world/WorldToolbar.svelte';
	import type { WorldActivity } from '$lib/contracts/WorldActivity';
	import type { WorldPin } from '$lib/contracts/WorldPin';
	import { olderFeedPathFor, type FeedGroup } from '$lib/domain/world/feedGroups';
	import { filterWorldPins, type WorldFilters } from '$lib/domain/world/worldFilters';
	import type { FlyToTarget } from '$lib/game/world/flyTo';
	import { LiveWorld } from '$lib/game/world/liveWorld.svelte';
	import { subscribeToWorldEvents } from '$lib/game/world/realtimeFeed';
	import { filtersFromSearchParams, selectedLakeFrom, worldUrlFor } from '$lib/game/world/worldUrl';
	import { createBrowserSupabase } from '$lib/supabase/createBrowserSupabase';

	let { data } = $props();

	const FlyToZoom = 3;
	const QuietNavigation = { replaceState: true, keepFocus: true, noScroll: true } as const;

	const live = new LiveWorld(untrack(() => data.feed));
	let hero: WorldHero;

	const filters = $derived(filtersFromSearchParams(page.url.searchParams));
	const selectedLakeId = $derived(selectedLakeFrom(page.url.searchParams));
	const favouriteIds = $derived(new Set(data.favouriteIds));
	const matches = $derived(filterWorldPins(data.pins, filters, favouriteIds));
	const isSelectedAFavourite = $derived(selectedLakeId !== null && favouriteIds.has(selectedLakeId));
	const pinById = (lakeId: string | null) => data.pins.find((pin) => pin.id === lakeId) ?? null;

	$effect(() => live.usePins(data.pins));
	$effect(() => subscribeToWorldEvents(createBrowserSupabase(), (event) => live.receive(event)));

	const navigate = (nextFilters: WorldFilters, lakeId: string | null) => goto(worldUrlFor(nextFilters, lakeId), QuietNavigation);

	function applyFilters(next: WorldFilters) {
		const previousRegion = filters.region;
		navigate(next, selectedLakeId);
		if (next.region && next.region !== previousRegion) hero.flyToRegion(next.region);
	}

	function select(pin: WorldPin | null) {
		navigate(filters, pin?.id ?? null);
	}

	function pickLake(lakeId: string) {
		const pin = pinById(lakeId);
		if (!pin) return goto(`/lakes/${lakeId}`);
		select(pin);
		hero.flyTo(pin.latitude, pin.longitude, FlyToZoom);
	}

	function flyTo(target: FlyToTarget) {
		if (target === 'somewhere_new') return hero.flyToRandom();
		const pin = target === 'my_water' ? pinById(data.myLakeId) : biggestFishPin();
		if (pin) pickLake(pin.id);
	}

	async function loadOlder(before: string, group: FeedGroup | null): Promise<WorldActivity[]> {
		const response = await fetch(olderFeedPathFor(before, group));
		const older = response.ok ? ((await response.json()) as WorldActivity[]) : [];
		live.remember(older);
		return older;
	}

	function biggestFishPin() {
		const [heaviest] = [...data.pins].sort((first, second) => second.heaviestLb - first.heaviestLb);
		return heaviest ?? null;
	}
</script>

<svelte:head><title>The world · Carp Mania</title></svelte:head>

<PlaceBanner kind="signpost" title="The world" blurb="The greatest catches, the waters they came from, and every open water in the game pinned where it is">
	{#snippet actions()}
		<a href="/world/hall-of-fame" class="button-secondary text-base">Hall of fame</a>
		<a href="/anglers" class="button-secondary text-base">Anglers</a>
		<a href="/news" class="button-secondary text-base">News</a>
	{/snippet}
</PlaceBanner>

<div class="flex flex-col gap-4">
	<WorldToolbar {filters} shownCount={matches.length} totalCount={data.pins.length} hasMyWater={pinById(data.myLakeId) !== null} onChange={applyFilters} onFlyTo={flyTo} />
	<WorldHero bind:this={hero} pins={matches} hasAnyPins={data.pins.length > 0} {selectedLakeId} {isSelectedAFavourite} arcs={live.arcs} pulses={live.pulses} greatest={data.greatest} feed={live.feed} viewerId={data.user?.id ?? null} onSelect={select} onPickLake={pickLake} />
	<div class="grid gap-4 lg:grid-cols-[minmax(0,1fr)_20rem]">
		<div class="flex min-w-0 flex-col gap-4">
			<LiveFeed feed={live.feed} onPick={pickLake} onLoadOlder={loadOlder} />
			<section class="panel"><Leaderboards region={filters.region} /></section>
		</div>
		<aside class="panel"><MatchingWaters {matches} totalCount={data.pins.length} selectedPinId={selectedLakeId} onPick={select} /></aside>
	</div>
</div>
