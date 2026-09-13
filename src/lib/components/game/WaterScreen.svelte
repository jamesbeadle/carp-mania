<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { LayoutPoint } from '$lib/domain/layout/layoutTypes';
	import type { Carp, Lake, Profile, Swim } from '$lib/domain/types';
	import type { Point } from '$lib/game/scene/lakeShape';
	import type { CatchReportOutcome } from '$lib/game/session/landFish';
	import type { SessionState } from '$lib/game/session/sessionState.svelte';
	import { WatercraftShowsFishFrom } from '$lib/game/session/showingFish';
	import { Orientation } from '$lib/game/stage/orientation.svelte';
	import type { StageConditions } from '$lib/game/sky/stageConditions';
	import LakeCanvas from '../LakeCanvas.svelte';
	import SceneStage from '../stage/SceneStage.svelte';
	import CanvasOverlay from './CanvasOverlay.svelte';
	import CatchPhoto from './CatchPhoto.svelte';
	import FightMeter from './FightMeter.svelte';
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
	}

	let { session, lake, swims, carp, profile, conditions, showingAt, catchOutcome, overTheSky, onSwimClick, onWaterClick, onCastBlockedByIsland, onStrike, onFightFinished, onContinue, onReelIn }: Props = $props();

	const orientation = new Orientation();
	const canReadTheWater = $derived(Number(profile.watercraft) >= WatercraftShowsFishFrom);
	const fishShowingAt = $derived(canReadTheWater ? showingAt : []);

	$effect(() => orientation.watch());
</script>

{#snippet water()}
	<LakeCanvas {lake} {swims} {carp} selectedSwimId={session.swim?.id ?? null} rods={session.rods} isAnglerOnBank={session.phase !== 'choose_swim'} showingAt={fishShowingAt} {onSwimClick} {onWaterClick} {onCastBlockedByIsland} />
{/snippet}

{#snippet overTheLake()}
	<NextStepPrompt {session} />
	{#if session.rods.length > 0}<RodStatusBar rods={session.rods} {onReelIn} />{/if}
	{#if session.notice && !session.bite}<SessionNotice notice={session.notice} />{/if}
	{#if session.bite}<StrikeButton bite={session.bite} {onStrike} />{/if}
	{#if session.phase === 'fighting' && session.fight}
		<CanvasOverlay><FightMeter fight={session.fight} onFinished={onFightFinished} /></CanvasOverlay>
	{/if}
	{#if session.phase === 'landed' && session.lastLanded}
		<CanvasOverlay><CatchPhoto landed={session.lastLanded} anglerName={profile.display_name} lakeName={lake.name} {catchOutcome} {onContinue} /></CanvasOverlay>
	{/if}
{/snippet}

{#snippet deck()}
	<SessionDeck {session} {lake} {profile} {catchOutcome} {onStrike} {onFightFinished} {onContinue} {onReelIn} />
{/snippet}

{#if orientation.deckPlacement === 'none'}
	<SceneStage {conditions} {overTheSky} {water} {overTheLake} />
{:else}
	<SceneStage {conditions} {overTheSky} {water} {deck} deckPlacement={orientation.deckPlacement} />
{/if}
