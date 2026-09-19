<script lang="ts">
	import type { FishingVisit } from '$lib/contracts/FishingVisit';
	import type { TheBar } from '$lib/domain/fishing/honours';
	import type { OwnedTackle } from '$lib/domain/tackle/tackleBox';
	import type { RodSetup } from '$lib/domain/tackle/rodSetup';
	import type { Shoal } from '$lib/domain/stock/shoals';
	import type { Carp, Lake, Profile, Swim } from '$lib/domain/types';
	import { bringTheFishIn, castTheNextRod, reelTheRodIn, setOffToAnotherSwim, stayOnThisSwim, strikeAtTheBite, takeThePeg } from '$lib/game/session/anglerActions';
	import { buzzForBite } from '$lib/game/session/haptics';
	import { reportAndNameTheFish } from '$lib/game/session/nameTheLandedFish';
	import type { CatchReportOutcome } from '$lib/game/session/landFish';
	import { rememberRodSetups } from '$lib/game/session/saveRodSetups';
	import { quarterHourOf, sessionConditionsFor } from '$lib/game/session/sessionConditions';
	import { returnToFishing, tackleUp } from '$lib/game/session/sessionFlow';
	import { followTheBiteAlarm, quietTheBank } from '$lib/game/session/sessionSounds';
	import { SessionState } from '$lib/game/session/sessionState.svelte';
	import { reportLossesAsTheyHappen } from '$lib/game/session/tackleLoss';
	import { spotsShowingNow } from '$lib/game/session/showsThisHour';
	import { startTicking } from '$lib/game/session/tickSession';
	import { ambientSceneFor } from '$lib/game/sound/ambience/ambientScene';
	import { sound } from '$lib/game/sound/soundEngine.svelte';
	import HowToPlay from './HowToPlay.svelte';
	import KeyHints from './KeyHints.svelte';
	import SessionChrome from './SessionChrome.svelte';
	import TackleUpScreen from './TackleUpScreen.svelte';
	import WaterScreen from './WaterScreen.svelte';

	interface Props {
		lake: Lake;
		swims: Swim[];
		carp: Carp[];
		shoals: Shoal[];
		profile: Profile;
		visit: FishingVisit;
		bar: TheBar;
		owned: OwnedTackle[];
		matchBoardHref?: string | null;
	}

	let { lake, swims, carp, shoals, profile, visit, bar, owned, matchBoardHref = null }: Props = $props();

	const session = new SessionState(lake, carp, profile, visit, bar, shoals);
	let catchOutcome = $state<CatchReportOutcome | null>(null);
	let isAlarmMuted = $state(false);
	let isHowToPlayOpen = $state(false);
	const showingAt = $derived(spotsShowingNow(session, lake));
	const conditions = $derived(sessionConditionsFor(lake, visit.visitedAt, session.hour));
	const ambience = $derived(sessionConditionsFor(lake, visit.visitedAt, quarterHourOf(session.hour)));

	$effect(() => startTicking(session));
	$effect(() => void (showingAt.length > 0 && sound.play('rise')));
	$effect(() => followTheBiteAlarm(session.bite !== null, isAlarmMuted));
	$effect(() => void (session.bite && buzzForBite()));
	$effect(() => sound.startAmbience(ambientSceneFor(ambience)));
	$effect(() => () => sound.stopAmbience());
	$effect(() => quietTheBank);
	$effect(() => reportLossesAsTheyHappen(lake, visit.id, session, session.tackleLost.length));

	function handleTackleUp(setups: RodSetup[]) {
		tackleUp(session, setups);
		rememberRodSetups(lake.id, setups);
	}

	async function handleFightFinished() {
		const landed = bringTheFishIn(session);
		if (!landed) return;
		catchOutcome = null;
		catchOutcome = await reportAndNameTheFish(session, lake.id, visit.id, profile, landed);
	}
</script>

{#if session.phase === 'tackle_up' && session.swim}
	<TackleUpScreen {session} swim={session.swim} {lake} {profile} {owned} onReady={handleTackleUp} />
{:else}
	<WaterScreen
		{session}
		{lake}
		{swims}
		carp={session.carp}
		{profile}
		{conditions}
		{showingAt}
		{catchOutcome}
		onSwimClick={(swim) => takeThePeg(session, swim)}
		onWaterClick={(point) => castTheNextRod(session, point)}
		onCastBlockedByIsland={() => (session.notice = "You can't cast through the island — pick a spot with a clear line from your swim.")}
		onStrike={() => strikeAtTheBite(session)}
		onFightFinished={handleFightFinished}
		onContinue={() => returnToFishing(session)}
		onReelIn={(rodIndex) => reelTheRodIn(session, rodIndex)}
		onSetOff={() => setOffToAnotherSwim(session)}
		onStayPut={() => stayOnThisSwim(session)}
	>
		{#snippet overTheSky()}
			<SessionChrome {lake} {session} {matchBoardHref} bind:isAlarmMuted onHowToPlay={() => (isHowToPlayOpen = true)} />
			<KeyHints />
		{/snippet}
	</WaterScreen>
	<HowToPlay isOpen={isHowToPlayOpen} onClose={() => (isHowToPlayOpen = false)} />
{/if}
