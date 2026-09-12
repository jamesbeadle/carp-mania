<script lang="ts">
	import BailiffNote from '$lib/components/hub/BailiffNote.svelte';
	import HubCaption from '$lib/components/hub/HubCaption.svelte';
	import PlaceSheets from '$lib/components/hub/PlaceSheets.svelte';
	import BankPlace from '$lib/components/stage/BankPlace.svelte';
	import LakeStage from '$lib/components/stage/LakeStage.svelte';
	import { ambientSceneFor } from '$lib/game/sound/ambience/ambientScene';
	import { sound } from '$lib/game/sound/soundEngine.svelte';
	import { stageConditionsFor } from '$lib/game/sky/stageConditions';
	import { AmbientRises } from '$lib/game/stage/ambientRises.svelte';
	import { BankPlaces, placePointsFor, type BankPlace as Place, type PlaceId } from '$lib/game/stage/bankPlaces';
	import { StageClock } from '$lib/game/stage/stageClock.svelte';

	let { data } = $props();

	const clock = new StageClock();
	const rises = new AmbientRises();
	let openPlace = $state<PlaceId | null>(null);
	let isNoteOpen = $state(data.whileAway.daysSimulated > 0);

	const lake = $derived(data.fishery.lake);
	const conditions = $derived(stageConditionsFor(lake, clock.now));
	const placePoints = $derived(placePointsFor(lake.layout));
	const badges = $derived<Partial<Record<PlaceId, number>>>({ noticeboard: data.unreadCount, lodge: data.works.length });
	const isUnpinned = $derived(lake.latitude === null);

	$effect(() => clock.start());
	$effect(() => rises.start(lake.layout));
	$effect(() => sound.startAmbience(ambientSceneFor(conditions)));
	$effect(() => () => sound.stopAmbience());

	function open(place: Place) {
		openPlace = place.id;
		sound.play('open');
	}

	function close() {
		openPlace = null;
		isNoteOpen = false;
		sound.play('close');
	}
</script>

<svelte:head><title>{lake.name} · Carp Mania</title></svelte:head>

<div class="h-full">
	<LakeStage {lake} swims={data.fishery.swims} carp={data.fishery.carp} {conditions} showingAt={rises.points}>
		{#snippet overTheSky()}
			<HubCaption profile={data.profile} {lake} {conditions} />
		{/snippet}
		{#snippet overTheLake()}
			{#each BankPlaces as place (place.id)}
				<BankPlace {place} at={placePoints[place.id]} badge={badges[place.id] ?? 0} isAttentionNeeded={place.id === 'signpost' && isUnpinned} onOpen={open} />
			{/each}
		{/snippet}
	</LakeStage>
</div>

<PlaceSheets
	{openPlace}
	onClose={close}
	fishery={data.fishery}
	profile={data.profile}
	works={data.works}
	unreadNotifications={data.unreadNotifications}
	unreadCount={data.unreadCount}
	marketWatch={data.marketWatch}
	worldFeed={data.worldFeed}
	loadedAt={data.loadedAt}
/>
<BailiffNote summary={data.whileAway} isOpen={isNoteOpen} onClose={close} />
