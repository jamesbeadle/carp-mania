<script lang="ts">
	import type { MatchCard } from '$lib/contracts/MatchCard';
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
	import Skeleton from '../loading/Skeleton.svelte';
	import NextMatchCard from '../matches/NextMatchCard.svelte';
	import PlaceSheet from '../stage/PlaceSheet.svelte';

	interface Props {
		openPlace: PlaceId | null;
		onClose: () => void;
		fishery: MyFishery;
		profile: Profile;
		works: LakeWork[];
		unreadNotifications: Notification[];
		unreadCount: number;
		marketWatch: Promise<MyMarketActivity>;
		worldFeed: Promise<WorldActivity[]>;
		loadedAt: string;
		waters: Lake[];
		nextMatch: Promise<MatchCard | null>;
	}

	let { openPlace, onClose, fishery, profile, works, unreadNotifications, unreadCount, marketWatch, worldFeed, loadedAt, waters, nextMatch }: Props = $props();

	const CouldNotLoad = 'That would not load. Close the sheet and open it again.';
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
		{#await marketWatch}
			<Skeleton title="Market watch" rows={4} />
		{:then watch}
			<MarketWatchCard {watch} {loadedAt} />
		{:catch}
			<p class="text-sm text-mist-400">{CouldNotLoad}</p>
		{/await}
	{:else if openPlace === 'noticeboard'}
		<InboxCard notifications={unreadNotifications} {unreadCount} />
	{:else if openPlace === 'jetty'}
		<AnglerSummaryCard {profile} />
		<a href="/fish/{fishery.lake.id}" class="button-secondary block text-center">Fish my own water</a>
		{#await nextMatch}
			<Skeleton title="Matches" rows={2} />
		{:then match}
			<NextMatchCard nextMatch={match} {loadedAt} />
		{:catch}
			<p class="text-sm text-mist-400">{CouldNotLoad}</p>
		{/await}
	{:else if openPlace === 'signpost'}
		{#if isUnpinned}<PinYourWaterCard lakeName={fishery.lake.name} />{/if}
		{#await worldFeed}
			<Skeleton title="The world" rows={6} />
		{:then feed}
			<WorldFeedCard {feed} />
		{:catch}
			<p class="text-sm text-mist-400">{CouldNotLoad}</p>
		{/await}
		<a href="/world/hall-of-fame" class="button-secondary block text-center">The hall of fame</a>
	{/if}
</PlaceSheet>
