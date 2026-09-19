<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { LayoutPoint } from '$lib/domain/layout/layoutTypes';
	import type { Carp, Lake, Profile, Swim } from '$lib/domain/types';
	import type { Point } from '$lib/game/scene/lakeShape';
	import type { CatchReportOutcome } from '$lib/game/session/landFish';
	import type { SessionState } from '$lib/game/session/sessionState.svelte';
	import { formatFishingHour } from '$lib/domain/fishing/sessionClock';
	import { canReadTheWater } from '$lib/domain/fishing/showingFish';
	import { settleAfterTheCatch, swallowKeysWhileSettling } from '$lib/game/session/catchSettling';
	import { Orientation } from '$lib/game/stage/orientation.svelte';
	import type { StageConditions } from '$lib/game/sky/stageConditions';
	import LakeCanvas from '../LakeCanvas.svelte';
	import SceneStage from '../stage/SceneStage.svelte';
	import CanvasOverlay from './CanvasOverlay.svelte';
	import CatchPhoto from './CatchPhoto.svelte';
	import DayOverSummary from './DayOverSummary.svelte';
	import FightMeter from './FightMeter.svelte';
	import MoveSwimButton from './MoveSwimButton.svelte';
	import NextStepPrompt from './NextStepPrompt.svelte';
	import RodStatusBar from './RodStatusBar.svelte';
	import SessionDeck from './SessionDeck.svelte';
	import SessionNotice from './SessionNotice.svelte';
	import StrikeButton from './StrikeButton.svelte';

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
	const fishShowingAt = $derived(canReadTheWater(Number(profile.watercraft)) ? showingAt : []);

	$effect(() => orientation.watch());
	$effect(() => settleAfterTheCatch(session.isSettlingAfterCatch));
</script>

<svelte:window onkeydowncapture={(event) => swallowKeysWhileSettling(event, session.isSettlingAfterCatch)} />

{#snippet water()}
	<LakeCanvas {lake} {swims} {carp} shoals={session.shoals} {selectedSwimId} rods={session.rods} isAnglerOnBank={session.phase !== 'choose_swim'} showingAt={fishShowingAt} {onSwimClick} {onWaterClick} {onCastBlockedByIsland} />
{/snippet}

{#snippet overTheLake()}
	<NextStepPrompt {session} />
	{#if session.rods.length > 0 && session.phase !== 'day_over'}<RodStatusBar rods={session.rods} {onReelIn} />{/if}
	<MoveSwimButton {session} {onSetOff} {onStayPut} />
	{#if session.notice && !session.bite}<SessionNotice notice={session.notice} />{/if}
	{#if session.bite}<StrikeButton bite={session.bite} {onStrike} />{/if}
	{#if session.phase === 'fighting' && session.fight}
		<CanvasOverlay><FightMeter fight={session.fight} onFinished={onFightFinished} /></CanvasOverlay>
	{/if}
	{#if session.phase === 'landed' && session.lastLanded}
		<CanvasOverlay><CatchPhoto landed={session.lastLanded} anglerName={profile.display_name} lakeName={lake.name} {catchOutcome} isSettling={session.isSettlingAfterCatch} {onContinue} /></CanvasOverlay>
	{/if}
	{#if session.phase === 'day_over'}
		<CanvasOverlay><DayOverSummary landed={session.landedToday} lost={session.lostToday} lakeId={lake.id} visitId={session.visitId} sessionsLeft={session.sessionsLeft} endWords={formatFishingHour(session.window.toHour)} /></CanvasOverlay>
	{/if}
{/snippet}

{#snippet deck()}
	<SessionDeck {session} {lake} {profile} {catchOutcome} {onContinue} {onReelIn} {onSetOff} {onStayPut} />
{/snippet}

{#if orientation.deckPlacement === 'none'}
	<SceneStage {conditions} {overTheSky} {water} {overTheLake} />
{:else}
	<SceneStage {conditions} {overTheSky} {water} {deck} deckPlacement={orientation.deckPlacement} />
	{#if session.bite}<StrikeButton bite={session.bite} {onStrike} placement="over_the_screen" />{/if}
	{#if session.phase === 'fighting' && session.fight}
		<CanvasOverlay placement="over_the_screen"><FightMeter fight={session.fight} onFinished={onFightFinished} placement="over_the_screen" /></CanvasOverlay>
	{/if}
{/if}
