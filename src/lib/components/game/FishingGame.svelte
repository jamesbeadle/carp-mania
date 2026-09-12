<script lang="ts">
	import type { FishingVisit } from '$lib/contracts/FishingVisit';
	import type { LayoutPoint } from '$lib/domain/layout/layoutTypes';
	import type { RodSetup } from '$lib/domain/tackle/rodSetup';
	import type { Carp, Lake, Profile, Swim } from '$lib/domain/types';
	import { BiteAlarm } from '$lib/game/session/biteAlarm';
	import { reportLandedFish } from '$lib/game/session/landFish';
	import { rememberRodSetups } from '$lib/game/session/saveRodSetups';
	import { castRod, chooseSwim, finishFight, nextRodToCast, returnToFishing, strike, tackleUp } from '$lib/game/session/sessionFlow';
	import { SessionState } from '$lib/game/session/sessionState.svelte';
	import { watchFishShowing } from '$lib/game/session/showingFish';
	import type { ViewMode } from '$lib/game/scene/camera';
	import DayOverSummary from './DayOverSummary.svelte';
	import HowToPlay from './HowToPlay.svelte';
	import KeyHints from './KeyHints.svelte';
	import TackleBuilder from './TackleBuilder.svelte';
	import WaterScreen from './WaterScreen.svelte';

	let { lake, swims, carp, profile, visit }: { lake: Lake; swims: Swim[]; carp: Carp[]; profile: Profile; visit: FishingVisit } = $props();

	const session = new SessionState(lake, carp, profile, visit);
	const alarm = new BiteAlarm();
	let isCatchSaved = $state<boolean | null>(null);
	let isAlarmMuted = $state(false);
	let viewMode = $state<ViewMode>('birdseye');
	let showingAt = $state<LayoutPoint[]>([]);

	$effect(() => {
		let last = performance.now();
		const interval = setInterval(() => {
			const now = performance.now();
			session.tick((now - last) / 1000);
			last = now;
		}, 100);
		return () => clearInterval(interval);
	});
	$effect(() => watchFishShowing(lake, session.carp, session.season, (spots) => (showingAt = spots)));
	$effect(() => {
		if (session.bite) return alarm.start();
		alarm.stop();
	});
	$effect(() => {
		alarm.isMuted = isAlarmMuted;
	});

	function handleTackleUp(setups: RodSetup[]) {
		tackleUp(session, setups);
		rememberRodSetups(lake.id, setups);
		viewMode = 'swim';
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
	<TackleBuilder {lake} swim={session.swim} season={session.season} overallSkill={session.overallSkill} savedRods={profile.saved_rods ?? []} onReady={handleTackleUp} />
{:else if session.phase === 'day_over'}
	<DayOverSummary landed={session.landedToday} lost={session.lostToday} lakeId={lake.id} />
{:else}
	<div class="mx-auto max-w-5xl space-y-4">
		<WaterScreen
			{session}
			{lake}
			{swims}
			carp={session.carp}
			{profile}
			{showingAt}
			{isCatchSaved}
			bind:viewMode
			onSwimClick={(swim) => session.phase === 'choose_swim' && chooseSwim(session, swim)}
			onWaterClick={handleWaterClick}
			onCastBlockedByIsland={() => (session.notice = "You can't cast through the island — pick a spot with a clear line from your swim.")}
			onStrike={() => strike(session)}
			onFightFinished={handleFightFinished}
			onContinue={() => returnToFishing(session)}
		/>
		<KeyHints bind:isAlarmMuted />
		<HowToPlay />
	</div>
{/if}
