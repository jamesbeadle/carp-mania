<script lang="ts">
	import type { Lake, Profile } from '$lib/domain/types';
	import type { CatchReportOutcome } from '$lib/game/session/landFish';
	import type { SessionState } from '$lib/game/session/sessionState.svelte';
	import FightMeter from './FightMeter.svelte';
	import ScreenOverlay from './ScreenOverlay.svelte';
	import SessionCatchPhoto from './SessionCatchPhoto.svelte';
	import SessionDayOver from './SessionDayOver.svelte';
	import StrikeButton from './StrikeButton.svelte';

	interface Props {
		session: SessionState;
		lake: Lake;
		profile: Profile;
		catchOutcome: CatchReportOutcome | null;
		onStrike: () => void;
		onFightFinished: () => void;
		onContinue: () => void;
	}

	let { session, lake, profile, catchOutcome, onStrike, onFightFinished, onContinue }: Props = $props();

	const isFighting = $derived(session.phase === 'fighting' && session.fight !== null);
	const isOnTheMat = $derived(session.phase === 'landed' && session.lastLanded !== null);
	const isDayOver = $derived(session.phase === 'day_over');
</script>

{#if session.bite}<StrikeButton bite={session.bite} {onStrike} />{/if}
{#if isFighting && session.fight}
	<ScreenOverlay><FightMeter fight={session.fight} onFinished={onFightFinished} /></ScreenOverlay>
{/if}
{#if isOnTheMat && session.lastLanded}
	<ScreenOverlay isWide><SessionCatchPhoto {session} landed={session.lastLanded} {lake} {profile} {catchOutcome} {onContinue} /></ScreenOverlay>
{/if}
{#if isDayOver}
	<ScreenOverlay isWide><SessionDayOver {session} {lake} /></ScreenOverlay>
{/if}
