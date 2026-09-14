<script lang="ts">
	import type { Lake, Profile } from '$lib/domain/types';
	import type { CatchReportOutcome } from '$lib/game/session/landFish';
	import type { SessionState } from '$lib/game/session/sessionState.svelte';
	import CatchPhoto from './CatchPhoto.svelte';
	import DayOverSummary from './DayOverSummary.svelte';
	import FightMeter from './FightMeter.svelte';
	import MoveSwimButton from './MoveSwimButton.svelte';
	import NextStepPrompt from './NextStepPrompt.svelte';
	import RodStatusBar from './RodStatusBar.svelte';
	import SessionNotice from './SessionNotice.svelte';

	interface Props {
		session: SessionState;
		lake: Lake;
		profile: Profile;
		catchOutcome: CatchReportOutcome | null;
		onFightFinished: () => void;
		onContinue: () => void;
		onReelIn: (rodIndex: number) => void;
		onSetOff: () => void;
		onStayPut: () => void;
	}

	let { session, lake, profile, catchOutcome, onFightFinished, onContinue, onReelIn, onSetOff, onStayPut }: Props = $props();
</script>

<div class="flex flex-col gap-3 px-3 py-3">
	{#if session.phase === 'fighting' && session.fight}
		<FightMeter fight={session.fight} onFinished={onFightFinished} />
	{:else if session.phase === 'landed' && session.lastLanded}
		<CatchPhoto landed={session.lastLanded} anglerName={profile.display_name} lakeName={lake.name} {catchOutcome} {onContinue} />
	{:else if session.phase === 'day_over'}
		<DayOverSummary landed={session.landedToday} lost={session.lostToday} lakeId={lake.id} />
	{:else}
		<NextStepPrompt {session} isDocked />
		{#if session.notice && !session.bite}<SessionNotice notice={session.notice} isDocked />{/if}
		{#if session.rods.length > 0}<RodStatusBar rods={session.rods} isDocked {onReelIn} />{/if}
		<MoveSwimButton {session} isDocked {onSetOff} {onStayPut} />
	{/if}
</div>
