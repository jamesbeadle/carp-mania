<script lang="ts">
	import type { FightState } from '$lib/game/session/fightState.svelte';
	import { buzzForARun } from '$lib/game/session/haptics';
	import { ReelInput } from '$lib/game/session/reelInput.svelte';
	import { followTheFight } from '$lib/game/session/sessionSounds';
	import { formatWeight } from '$lib/format/weight';
	import ReelZone from './ReelZone.svelte';
	import RunWarning from './RunWarning.svelte';
	import TensionBar from './TensionBar.svelte';

	type Placement = 'over_the_lake' | 'over_the_screen';

	let { fight, onFinished, placement = 'over_the_lake' }: { fight: FightState; onFinished: () => void; placement?: Placement } = $props();

	const reel = new ReelInput();
	const GuessRoundingLb = 5;
	const MostSecondsPerFrame = 0.1;
	const MillisecondsPerSecond = 1000;
	const guessedWeight = $derived(Math.round(Number(fight.carp.weight_lb) / GuessRoundingLb) * GuessRoundingLb);

	$effect(() => {
		let handle = 0;
		let last = performance.now();
		const frame = (now: number) => {
			fight.isReeling = reel.isReeling;
			fight.advance(Math.min(MostSecondsPerFrame, (now - last) / MillisecondsPerSecond));
			last = now;
			if (fight.outcome) return onFinished();
			handle = requestAnimationFrame(frame);
		};
		handle = requestAnimationFrame(frame);
		return () => cancelAnimationFrame(handle);
	});

	$effect(() => followTheFight(fight.isReeling, fight.isRunning));
	$effect(() => void (fight.isRunning && buzzForARun()));
	$effect(() => () => followTheFight(false, false));
</script>

<svelte:window onkeydown={(event) => reel.answerTheKey(event, true)} onkeyup={(event) => reel.answerTheKey(event, false)} onblur={() => reel.release()} />

<section class="panel space-y-4">
	<h3 class="text-xl text-volt-300">Fish on! Something around {formatWeight(guessedWeight)}</h3>
	<RunWarning isRunning={fight.isRunning} isRunComing={fight.isRunComing} />
	<TensionBar tension={fight.tension} band={fight.band} />
	<ReelZone {reel} isTall={placement === 'over_the_screen'} />
	<p class="text-center text-sm text-mist-400">{Math.ceil(fight.secondsRemaining)}s until it's in the net</p>
</section>
