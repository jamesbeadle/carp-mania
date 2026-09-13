<script lang="ts">
	import type { Lake, Profile } from '$lib/domain/types';
	import type { CatchReportOutcome } from '$lib/game/session/landFish';
	import type { SessionState } from '$lib/game/session/sessionState.svelte';
	import CatchPhoto from './CatchPhoto.svelte';
	import FightMeter from './FightMeter.svelte';
	import NextStepPrompt from './NextStepPrompt.svelte';
	import RodStatusBar from './RodStatusBar.svelte';
	import SessionNotice from './SessionNotice.svelte';
	import StrikeButton from './StrikeButton.svelte';

	interface Props {
		session: SessionState;
		lake: Lake;
		profile: Profile;
		catchOutcome: CatchReportOutcome | null;
		onStrike: () => void;
		onFightFinished: () => void;
		onContinue: () => void;
		onReelIn: (rodIndex: number) => void;
	}

	let { session, lake, profile, catchOutcome, onStrike, onFightFinished, onContinue, onReelIn }: Props = $props();
</script>

<div class="flex flex-col gap-3 px-3 py-3">
	{#if session.phase === 'fighting' && session.fight}
		<FightMeter fight={session.fight} onFinished={onFightFinished} />
	{:else if session.phase === 'landed' && session.lastLanded}
		<CatchPhoto landed={session.lastLanded} anglerName={profile.display_name} lakeName={lake.name} {catchOutcome} {onContinue} />
	{:else}
		{#if session.bite}<StrikeButton bite={session.bite} {onStrike} isDocked />{/if}
		<NextStepPrompt {session} isDocked />
		{#if session.notice && !session.bite}<SessionNotice notice={session.notice} isDocked />{/if}
		{#if session.rods.length > 0}<RodStatusBar rods={session.rods} isDocked {onReelIn} />{/if}
	{/if}
</div>
