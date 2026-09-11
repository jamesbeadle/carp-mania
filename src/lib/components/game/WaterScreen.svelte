<script lang="ts">
	import type { Carp, Lake, Profile, Swim } from '$lib/domain/types';
	import type { ViewMode } from '$lib/game/scene/camera';
	import type { Point } from '$lib/game/scene/lakeShape';
	import type { SessionState } from '$lib/game/session/sessionState.svelte';
	import LakeCanvas from '../LakeCanvas.svelte';
	import CanvasOverlay from './CanvasOverlay.svelte';
	import CatchPhoto from './CatchPhoto.svelte';
	import FightMeter from './FightMeter.svelte';
	import NextStepPrompt from './NextStepPrompt.svelte';
	import RodStatusBar from './RodStatusBar.svelte';
	import SessionClock from './SessionClock.svelte';
	import SessionNotice from './SessionNotice.svelte';
	import StrikeButton from './StrikeButton.svelte';
	import ViewToggle from './ViewToggle.svelte';

	interface Props {
		session: SessionState;
		lake: Lake;
		swims: Swim[];
		carp: Carp[];
		profile: Profile;
		isCatchSaved: boolean | null;
		viewMode: ViewMode;
		onSwimClick: (swim: Swim) => void;
		onWaterClick: (point: Point) => void;
		onCastBlockedByIsland: () => void;
		onStrike: () => void;
		onFightFinished: () => void;
		onContinue: () => void;
	}

	let { session, lake, swims, carp, profile, isCatchSaved, viewMode = $bindable(), onSwimClick, onWaterClick, onCastBlockedByIsland, onStrike, onFightFinished, onContinue }: Props = $props();
</script>

<div class="relative">
	<LakeCanvas {lake} {swims} {carp} selectedSwimId={session.swim?.id ?? null} rods={session.rods} isAnglerOnBank={session.phase !== 'choose_swim'} {viewMode} {onSwimClick} {onWaterClick} {onCastBlockedByIsland} />
	<NextStepPrompt {session} />
	<ViewToggle bind:viewMode hasSwim={session.swim !== null} />
	{#if session.phase !== 'choose_swim'}<SessionClock hour={session.hour} landed={session.landedToday.length} lost={session.lostToday} />{/if}
	{#if session.rods.length > 0}<RodStatusBar rods={session.rods} />{/if}
	{#if session.notice && !session.bite}<SessionNotice notice={session.notice} />{/if}
	{#if session.bite}<StrikeButton bite={session.bite} {onStrike} />{/if}
	{#if session.phase === 'fighting' && session.fight}
		<CanvasOverlay><FightMeter fight={session.fight} onFinished={onFightFinished} /></CanvasOverlay>
	{/if}
	{#if session.phase === 'landed' && session.lastLanded}
		<CanvasOverlay><CatchPhoto landed={session.lastLanded} anglerName={profile.display_name} lakeName={lake.name} isSaved={isCatchSaved} {onContinue} /></CanvasOverlay>
	{/if}
</div>
