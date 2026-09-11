<script lang="ts">
	import type { Carp, Lake, Profile, Swim } from '$lib/domain/types';
	import { reportLandedFish } from '$lib/game/session/landFish';
	import { castRod, chooseSwim, finishFight, nextRodToCast, returnToFishing, strike, tackleUp } from '$lib/game/session/sessionFlow';
	import { SessionState } from '$lib/game/session/sessionState.svelte';
	import { BiteAlarm } from '$lib/game/session/biteAlarm';
	import { rememberRodSetups } from '$lib/game/session/saveRodSetups';
	import type { RodSetup } from '$lib/domain/tackle/rodSetup';
	import LakeCanvas from '../LakeCanvas.svelte';
	import CatchPhoto from './CatchPhoto.svelte';
	import DayOverSummary from './DayOverSummary.svelte';
	import FightMeter from './FightMeter.svelte';
	import SessionHud from './SessionHud.svelte';
	import TackleBuilder from './TackleBuilder.svelte';

	let { lake, swims, carp, profile, visitId }: { lake: Lake; swims: Swim[]; carp: Carp[]; profile: Profile; visitId: string } = $props();

	const session = new SessionState(lake, carp, profile);
	const alarm = new BiteAlarm();
	let isCatchSaved = $state<boolean | null>(null);
	let isAlarmMuted = $state(false);

	$effect(() => {
		if (session.bite) return alarm.start();
		alarm.stop();
	});
	$effect(() => {
		alarm.isMuted = isAlarmMuted;
	});

	$effect(() => {
		let last = performance.now();
		const interval = setInterval(() => {
			const now = performance.now();
			session.tick((now - last) / 1000);
			last = now;
		}, 100);
		return () => clearInterval(interval);
	});

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
		isCatchSaved = await reportLandedFish(lake.id, visitId, profile, session.lastLanded);
	}
</script>

{#if session.phase === 'choose_swim'}
	<p class="mb-3 text-mist-200">Walk the bank and click a swim peg to set up there. Think about the bottom, the depth and what the fish have been fed.</p>
{/if}

{#if session.phase === 'tackle_up' && session.swim}
	<TackleBuilder {lake} swim={session.swim} overallSkill={session.overallSkill} savedRods={profile.saved_rods ?? []} onReady={handleTackleUp} />
{:else if session.phase === 'day_over'}
	<DayOverSummary landed={session.landedToday} lost={session.lostToday} lakeId={lake.id} />
{:else}
	<div class="grid gap-6 lg:grid-cols-[3fr_2fr]">
		<LakeCanvas
			{lake}
			{swims}
			{carp}
			selectedSwimId={session.swim?.id ?? null}
			rods={session.rods}
			isAnglerOnBank={session.phase !== 'choose_swim'}
			onSwimClick={(swim) => session.phase === 'choose_swim' && chooseSwim(session, swim)}
			onWaterClick={handleWaterClick}
			onCastBlockedByIsland={() => (session.notice = "You can't cast through the island — pick a spot with a clear line from your swim.")}
		/>
		<div>
			{#if session.phase === 'fighting' && session.fight}
				<FightMeter fight={session.fight} onFinished={handleFightFinished} />
			{:else if session.phase === 'landed' && session.lastLanded}
				<CatchPhoto landed={session.lastLanded} anglerName={profile.display_name} lakeName={lake.name} isSaved={isCatchSaved} onContinue={() => returnToFishing(session)} />
			{:else if session.phase === 'fishing'}
				<SessionHud {session} bind:isAlarmMuted onStrike={() => strike(session)} />
			{:else}
				<section class="panel text-sm text-mist-400">Pick a swim on the map to begin.</section>
			{/if}
		</div>
	</div>
{/if}
