<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { LayoutPoint } from '$lib/domain/layout/layoutTypes';
	import type { Carp, Lake, Profile, Swim } from '$lib/domain/types';
	import type { Point } from '$lib/game/scene/lakeShape';
	import type { CatchReportOutcome } from '$lib/game/session/landFish';
	import type { SessionState } from '$lib/game/session/sessionState.svelte';
	import { canReadTheWater } from '$lib/domain/fishing/showingFish';
	import { castReachOf } from '$lib/game/session/castReach';
	import { settleAfterTheCatch, swallowKeysWhileSettling } from '$lib/game/session/catchSettling';
	import { Orientation } from '$lib/game/stage/orientation.svelte';
	import type { StageConditions } from '$lib/game/sky/stageConditions';
	import { isWebGlAvailable } from '$lib/game/lake3d/webGlAvailability';
	import LakeCanvas from '../LakeCanvas.svelte';
	import { lakeView3dOnDemand, type LakeView3DComponent } from '../lake3d/lake3dOnDemand';
	import WaterVeil from '../lake3d/WaterVeil.svelte';
	import ViewToggle from './ViewToggle.svelte';
	import SceneStage from '../stage/SceneStage.svelte';
	import SessionDeck from './SessionDeck.svelte';
	import SessionMoments from './SessionMoments.svelte';

	interface Props {
		session: SessionState;
		lake: Lake;
		swims: Swim[];
		carp: Carp[];
		profile: Profile;
		conditions: StageConditions;
		showingAt: LayoutPoint[];
		catchOutcome: CatchReportOutcome | null;
		overTheSky: Snippet;
		onSwimClick: (swim: Swim) => void;
		onWaterClick: (point: Point) => void;
		onCastBlockedByIsland: () => void;
		onStrike: () => void;
		onFightFinished: () => void;
		onContinue: () => void;
		onReelIn: (rodIndex: number) => void;
		onSetOff: () => void;
		onStayPut: () => void;
	}

	let { session, lake, swims, carp, profile, conditions, showingAt, catchOutcome, overTheSky, onSwimClick, onWaterClick, onCastBlockedByIsland, onStrike, onFightFinished, onContinue, onReelIn, onSetOff, onStayPut }: Props = $props();

	const selectedSwimId = $derived(session.swim?.id ?? null);
	const orientation = new Orientation();
	const isDeckBeside = $derived(orientation.deckPlacement === 'beside');
	const fishShowingAt = $derived(canReadTheWater(session.watercraft) ? showingAt : []);
	const castReach = $derived(castReachOf(session));

	const CastProblemWords = { on_the_bank: 'That would land on the bank — aim for the water.', through_an_island: "You can't cast through the island — pick a spot with a clear line from your swim." } as const;
	let isIn3d = $state(false);
	let canShow3d = $state(false);
	let LakeView3D = $state<LakeView3DComponent | null>(null);

	$effect(() => {
		canShow3d = isWebGlAvailable();
		isIn3d = canShow3d;
	});

	$effect(() => {
		if (isIn3d) void lakeView3dOnDemand().then((loaded) => (LakeView3D = loaded));
	});
	$effect(() => orientation.watch());
	$effect(() => settleAfterTheCatch(session.isSettlingAfterCatch));
</script>

<svelte:window onkeydowncapture={(event) => swallowKeysWhileSettling(event, session.isSettlingAfterCatch)} onkeyupcapture={(event) => swallowKeysWhileSettling(event, session.isSettlingAfterCatch)} />

{#snippet water()}
	{#if isIn3d}
		{#if LakeView3D}<LakeView3D {session} {lake} {swims} {carp} shoals={session.shoals} {conditions} showingAt={fishShowingAt} {castReach} {onSwimClick} {onWaterClick} onCastBlocked={(problem) => (session.notice = CastProblemWords[problem])} />{:else}<WaterVeil />{/if}
	{:else}
		<LakeCanvas {lake} {swims} {carp} shoals={session.shoals} {selectedSwimId} rods={session.rods} isAnglerOnBank={session.phase !== 'choose_swim'} showingAt={fishShowingAt} {castReach} {onSwimClick} {onWaterClick} {onCastBlockedByIsland} />
	{/if}
	{#if canShow3d}<ViewToggle bind:isIn3d />{/if}
{/snippet}

{#snippet deck()}
	<SessionDeck {session} {swims} isBesideTheWater={isDeckBeside} onPickSwim={onSwimClick} {onReelIn} {onSetOff} {onStayPut} />
{/snippet}

<SceneStage {conditions} {overTheSky} {water} {deck} deckPlacement={orientation.deckPlacement} isImmersive={isIn3d} />
<SessionMoments {session} {lake} {profile} {catchOutcome} {onStrike} {onFightFinished} {onContinue} isImmersive={isIn3d} />
