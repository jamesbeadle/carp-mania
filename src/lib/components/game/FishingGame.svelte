<script lang="ts">
	import type { FishingVisit } from '$lib/contracts/FishingVisit';
	import type { LayoutPoint } from '$lib/domain/layout/layoutTypes';
	import type { RodSetup } from '$lib/domain/tackle/rodSetup';
	import type { Carp, Lake, Profile, Swim } from '$lib/domain/types';
	import { BiteAlarm } from '$lib/game/session/biteAlarm';
	import { buzzForBite } from '$lib/game/session/haptics';
	import { reportLandedFish } from '$lib/game/session/landFish';
	import { rememberRodSetups } from '$lib/game/session/saveRodSetups';
	import { quarterHourOf, sessionConditionsFor } from '$lib/game/session/sessionConditions';
	import { castRod, chooseSwim, finishFight, nextRodToCast, returnToFishing, strike, tackleUp } from '$lib/game/session/sessionFlow';
	import { SessionState } from '$lib/game/session/sessionState.svelte';
	import { watchFishShowing } from '$lib/game/session/showingFish';
	import { startTicking } from '$lib/game/session/tickSession';
	import { ambientSceneFor } from '$lib/game/sound/ambience/ambientScene';
	import { sound } from '$lib/game/sound/soundEngine.svelte';
	import DayOverSummary from './DayOverSummary.svelte';
	import HowToPlay from './HowToPlay.svelte';
	import KeyHints from './KeyHints.svelte';
	import SessionChrome from './SessionChrome.svelte';
	import TackleBuilder from './TackleBuilder.svelte';
	import WaterScreen from './WaterScreen.svelte';

	let { lake, swims, carp, profile, visit }: { lake: Lake; swims: Swim[]; carp: Carp[]; profile: Profile; visit: FishingVisit } = $props();

	const session = new SessionState(lake, carp, profile, visit);
	const alarm = new BiteAlarm();
	let isCatchSaved = $state<boolean | null>(null);
	let isAlarmMuted = $state(false);
	let isHowToPlayOpen = $state(false);
	let showingAt = $state<LayoutPoint[]>([]);
	const conditions = $derived(sessionConditionsFor(lake, visit.visitedAt, quarterHourOf(session.hour)));

	$effect(() => startTicking(session));
	$effect(() => watchFishShowing(lake, session.carp, session.season, (spots) => (showingAt = spots)));
	$effect(() => {
		if (!session.bite) return alarm.stop();
		alarm.start();
		buzzForBite();
	});
	$effect(() => {
		alarm.isMuted = isAlarmMuted;
	});
	$effect(() => sound.startAmbience(ambientSceneFor(conditions)));
	$effect(() => () => sound.stopAmbience());

	function handleTackleUp(setups: RodSetup[]) {
		tackleUp(session, setups);
		rememberRodSetups(lake.id, setups);
	}

	function handleWaterClick(point: { x: number; y: number }) {
		if (session.phase !== 'fishing') return;
		alarm.arm();
		const rod = nextRodToCast(session);
		if (!rod) return (session.notice = 'All rods are out. Wait for a bite.');
		castRod(session, rod.index, point);
	}

	async function handleFightFinished() {
		finishFight(session);
		if (!session.lastLanded) return;
		isCatchSaved = null;
		isCatchSaved = await reportLandedFish(lake.id, visit.id, profile, session.lastLanded);
	}
</script>

{#if session.phase === 'tackle_up' && session.swim}
	<div class="h-full overflow-y-auto px-4 py-6"><div class="mx-auto max-w-5xl"><TackleBuilder {lake} swim={session.swim} season={session.season} overallSkill={session.overallSkill} savedRods={profile.saved_rods ?? []} onReady={handleTackleUp} /></div></div>
{:else if session.phase === 'day_over'}
	<div class="h-full overflow-y-auto px-4 py-6"><div class="mx-auto max-w-3xl"><DayOverSummary landed={session.landedToday} lost={session.lostToday} lakeId={lake.id} /></div></div>
{:else}
	<WaterScreen
		{session}
		{lake}
		{swims}
		carp={session.carp}
		{profile}
		{conditions}
		{showingAt}
		{isCatchSaved}
		onSwimClick={(swim) => session.phase === 'choose_swim' && chooseSwim(session, swim)}
		onWaterClick={handleWaterClick}
		onCastBlockedByIsland={() => (session.notice = "You can't cast through the island — pick a spot with a clear line from your swim.")}
		onStrike={() => strike(session)}
		onFightFinished={handleFightFinished}
		onContinue={() => returnToFishing(session)}
	>
		{#snippet overTheSky()}
			<SessionChrome {lake} {session} bind:isAlarmMuted onHowToPlay={() => (isHowToPlayOpen = true)} />
			<KeyHints />
		{/snippet}
	</WaterScreen>
	<HowToPlay isOpen={isHowToPlayOpen} onClose={() => (isHowToPlayOpen = false)} />
{/if}
