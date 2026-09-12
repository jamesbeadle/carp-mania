<script lang="ts">
	import { untrack } from 'svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import PlaceBanner from '$lib/components/place/PlaceBanner.svelte';
	import FilterRail from '$lib/components/world/FilterRail.svelte';
	import type { FlyToTarget } from '$lib/components/world/FlyToButtons.svelte';
	import LiveFeed from '$lib/components/world/LiveFeed.svelte';
	import PostcardDrawer from '$lib/components/world/PostcardDrawer.svelte';
	import WorldStage from '$lib/components/world/WorldStage.svelte';
	import type { WorldPin } from '$lib/contracts/WorldPin';
	import { filterWorldPins, type WorldFilters } from '$lib/domain/world/worldFilters';
	import { LiveWorld } from '$lib/game/world/liveWorld.svelte';
	import { subscribeToWorldEvents } from '$lib/game/world/realtimeFeed';
	import { filtersFromSearchParams, selectedLakeFrom, worldUrlFor } from '$lib/game/world/worldUrl';
	import { createBrowserSupabase } from '$lib/supabase/createBrowserSupabase';

	let { data } = $props();

	const FlyToZoom = 3;
	const QuietNavigation = { replaceState: true, keepFocus: true, noScroll: true } as const;

	const live = new LiveWorld(untrack(() => data.feed));
	let stage: WorldStage;
	let isRailOpen = $state(false);

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
		if (next.region && next.region !== previousRegion) stage.flyToRegion(next.region);
	}

	function select(pin: WorldPin | null) {
		navigate(filters, pin?.id ?? null);
	}

	function pickLake(lakeId: string) {
		const pin = pinById(lakeId);
		if (pin) return select(pin);
		goto(`/lakes/${lakeId}`);
	}

	function flyTo(target: FlyToTarget) {
		if (target === 'somewhere_new') return stage.flyToRandom();
		const pin = target === 'my_water' ? pinById(data.myLakeId) : biggestFishPin();
		if (!pin) return;
		select(pin);
		stage.flyTo(pin.latitude, pin.longitude, FlyToZoom);
	}

	function biggestFishPin() {
		const [heaviest] = [...data.pins].sort((first, second) => second.heaviestLb - first.heaviestLb);
		return heaviest ?? null;
	}
</script>

<svelte:head><title>The world · Carp Mania</title></svelte:head>

<PlaceBanner kind="signpost" title="The world" blurb="Every open water in the game, pinned where it is. Spin, zoom, tap a pin.">
	{#snippet actions()}
		<a href="/world/hall-of-fame" class="button-secondary text-base">Hall of fame</a>
		<a href="/matches" class="button-secondary text-base">Matches</a>
		<a href="/anglers" class="button-secondary text-base">Anglers</a>
		<button class="button-secondary text-base lg:hidden" onclick={() => (isRailOpen = !isRailOpen)}>{isRailOpen ? 'Hide filters' : 'Filters'}</button>
	{/snippet}
</PlaceBanner>

<div class="grid gap-4 lg:grid-cols-[18rem_minmax(0,1fr)_20rem]">
	<div class:hidden={!isRailOpen} class="lg:block">
		<FilterRail {filters} {matches} totalCount={data.pins.length} selectedPinId={selectedLakeId} hasMyWater={pinById(data.myLakeId) !== null} onChange={applyFilters} onFlyTo={flyTo} onPick={select} />
	</div>
	<div class="flex min-w-0 flex-col gap-4">
		<WorldStage bind:this={stage} pins={matches} hasAnyPins={data.pins.length > 0} selectedPinId={selectedLakeId} arcs={live.arcs} pulses={live.pulses} onSelect={select} />
		<LiveFeed feed={live.feed} onPick={pickLake} />
	</div>
	<PostcardDrawer lakeId={selectedLakeId} isFavourite={isSelectedAFavourite} onClose={() => select(null)} />
</div>
