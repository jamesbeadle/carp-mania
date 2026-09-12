<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { LayoutPoint } from '$lib/domain/layout/layoutTypes';
	import type { Carp, Lake, Profile, Swim } from '$lib/domain/types';
	import type { Point } from '$lib/game/scene/lakeShape';
	import type { SessionState } from '$lib/game/session/sessionState.svelte';
	import { WatercraftShowsFishFrom } from '$lib/game/session/showingFish';
	import type { StageConditions } from '$lib/game/sky/stageConditions';
	import LakeCanvas from '../LakeCanvas.svelte';
	import SceneStage from '../stage/SceneStage.svelte';
	import CanvasOverlay from './CanvasOverlay.svelte';
	import CatchPhoto from './CatchPhoto.svelte';
	import FightMeter from './FightMeter.svelte';
	import NextStepPrompt from './NextStepPrompt.svelte';
	import RodStatusBar from './RodStatusBar.svelte';
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
		isCatchSaved: boolean | null;
		overTheSky: Snippet;
		onSwimClick: (swim: Swim) => void;
		onWaterClick: (point: Point) => void;
		onCastBlockedByIsland: () => void;
		onStrike: () => void;
		onFightFinished: () => void;
		onContinue: () => void;
	}

	let { session, lake, swims, carp, profile, conditions, showingAt, isCatchSaved, overTheSky, onSwimClick, onWaterClick, onCastBlockedByIsland, onStrike, onFightFinished, onContinue }: Props = $props();

	const canReadTheWater = $derived(Number(profile.watercraft) >= WatercraftShowsFishFrom);
	const fishShowingAt = $derived(canReadTheWater ? showingAt : []);
</script>

<SceneStage {conditions} {overTheSky}>
	{#snippet water()}
		<LakeCanvas {lake} {swims} {carp} selectedSwimId={session.swim?.id ?? null} rods={session.rods} isAnglerOnBank={session.phase !== 'choose_swim'} showingAt={fishShowingAt} {onSwimClick} {onWaterClick} {onCastBlockedByIsland} />
	{/snippet}
	{#snippet overTheLake()}
		<NextStepPrompt {session} />
		{#if session.rods.length > 0}<RodStatusBar rods={session.rods} />{/if}
		{#if session.notice && !session.bite}<SessionNotice notice={session.notice} />{/if}
		{#if session.bite}<StrikeButton bite={session.bite} {onStrike} />{/if}
		{#if session.phase === 'fighting' && session.fight}
			<CanvasOverlay><FightMeter fight={session.fight} onFinished={onFightFinished} /></CanvasOverlay>
		{/if}
		{#if session.phase === 'landed' && session.lastLanded}
			<CanvasOverlay><CatchPhoto landed={session.lastLanded} anglerName={profile.display_name} lakeName={lake.name} isSaved={isCatchSaved} {onContinue} /></CanvasOverlay>
		{/if}
	{/snippet}
</SceneStage>
