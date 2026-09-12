<script lang="ts">
	import type { MyMarketActivity } from '$lib/contracts/MyMarketActivity';
	import type { WorldActivity } from '$lib/contracts/WorldActivity';
	import type { MyFishery } from '$lib/server/queries/GetMyFishery';
	import type { Lake, Profile } from '$lib/domain/types';
	import type { LakeWork, Notification } from '$lib/domain/worldTypes';
	import { BankPlaces, type PlaceId } from '$lib/game/stage/bankPlaces';
	import EstateSwitcher from '../estate/EstateSwitcher.svelte';
	import AnglerSummaryCard from '../home/AnglerSummaryCard.svelte';
	import FisherySummaryCard from '../home/FisherySummaryCard.svelte';
	import InboxCard from '../home/InboxCard.svelte';
	import MarketWatchCard from '../home/MarketWatchCard.svelte';
	import PinYourWaterCard from '../home/PinYourWaterCard.svelte';
	import WorksInProgressCard from '../home/WorksInProgressCard.svelte';
	import WorldFeedCard from '../home/WorldFeedCard.svelte';
	import PlaceSheet from '../stage/PlaceSheet.svelte';

	interface Props {
		openPlace: PlaceId | null;
		onClose: () => void;
		fishery: MyFishery;
		profile: Profile;
		works: LakeWork[];
		unreadNotifications: Notification[];
		unreadCount: number;
		marketWatch: MyMarketActivity;
		worldFeed: WorldActivity[];
		loadedAt: string;
		waters: Lake[];
	}

	let { openPlace, onClose, fishery, profile, works, unreadNotifications, unreadCount, marketWatch, worldFeed, loadedAt, waters }: Props = $props();

	const title = $derived(BankPlaces.find((place) => place.id === openPlace)?.label ?? '');
	const isUnpinned = $derived(fishery.lake.latitude === null);
</script>

<PlaceSheet {title} isOpen={openPlace !== null} {onClose}>
	{#if openPlace === 'lodge'}
		<EstateSwitcher {waters} currentId={fishery.lake.id} returnTo="/home" />
		{#if !fishery.lake.is_setup_complete}<a href="/setup" class="button-primary block text-center">Finish setting up {fishery.lake.name}</a>{/if}
		<FisherySummaryCard lake={fishery.lake} carp={fishery.carp} />
		<WorksInProgressCard {works} />
	{:else if openPlace === 'shop'}
		<MarketWatchCard watch={marketWatch} {loadedAt} />
	{:else if openPlace === 'noticeboard'}
		<InboxCard notifications={unreadNotifications} {unreadCount} />
	{:else if openPlace === 'jetty'}
		<AnglerSummaryCard {profile} />
		<a href="/fish/{fishery.lake.id}" class="button-secondary block text-center">Fish my own water</a>
	{:else if openPlace === 'signpost'}
		{#if isUnpinned}<PinYourWaterCard lakeName={fishery.lake.name} />{/if}
		<WorldFeedCard feed={worldFeed} />
		<a href="/world/hall-of-fame" class="button-secondary block text-center">The hall of fame</a>
	{/if}
</PlaceSheet>
