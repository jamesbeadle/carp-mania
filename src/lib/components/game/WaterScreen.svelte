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
	import LakeCanvas from '../LakeCanvas.svelte';
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
	const fishShowingAt = $derived(canReadTheWater(Number(profile.watercraft)) ? showingAt : []);
	const castReach = $derived(castReachOf(session));

	$effect(() => orientation.watch());
	$effect(() => settleAfterTheCatch(session.isSettlingAfterCatch));
</script>

<svelte:window onkeydowncapture={(event) => swallowKeysWhileSettling(event, session.isSettlingAfterCatch)} />

{#snippet water()}
	<LakeCanvas {lake} {swims} {carp} shoals={session.shoals} {selectedSwimId} rods={session.rods} isAnglerOnBank={session.phase !== 'choose_swim'} showingAt={fishShowingAt} {castReach} {onSwimClick} {onWaterClick} {onCastBlockedByIsland} />
{/snippet}

{#snippet deck()}
	<SessionDeck {session} {swims} isBesideTheWater={isDeckBeside} onPickSwim={onSwimClick} {onReelIn} {onSetOff} {onStayPut} />
{/snippet}

<SceneStage {conditions} {overTheSky} {water} {deck} deckPlacement={orientation.deckPlacement} />
<SessionMoments {session} {lake} {profile} {catchOutcome} {onStrike} {onFightFinished} {onContinue} />
