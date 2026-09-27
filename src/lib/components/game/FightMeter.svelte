<script lang="ts">
	import type { FightState } from '$lib/game/session/fightState.svelte';
	import { buzzForARun } from '$lib/game/session/haptics';
	import { ReelInput } from '$lib/game/session/reelInput.svelte';
	import { followTheFight } from '$lib/game/session/sessionSounds';
	import { formatWeight } from '$lib/format/weight';
	import ReelZone from './ReelZone.svelte';
	import RunWarning from './RunWarning.svelte';
	import TensionBar from './TensionBar.svelte';

	let { fight, onFinished }: { fight: FightState; onFinished: () => void } = $props();

	const reel = new ReelInput();
	const GuessRoundingLb = 5;
	const MostSecondsPerFrame = 0.1;
	const MillisecondsPerSecond = 1000;
	const carp = $derived(fight.carp);
	const guessedWeight = $derived(Math.round(Number(carp.weight_lb) / GuessRoundingLb) * GuessRoundingLb);

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

<section class="fight-hud hud-glass fixed left-1/2 z-40 w-[min(40rem,calc(100%-1.5rem))] -translate-x-1/2 px-4 py-3 sm:px-5">
	<div class="grid grid-cols-[auto_1fr_auto] items-baseline gap-3">
		<span class="hud-label text-mist-100">Line tension</span>
		<RunWarning isRunning={fight.isRunning} isRunComing={fight.isRunComing} />
		<span class="hud-label whitespace-nowrap">~{formatWeight(guessedWeight)} · {Math.ceil(fight.secondsRemaining)}s</span>
	</div>
	<TensionBar tension={fight.tension} band={fight.band} />
</section>
<ReelZone {reel} />

<style>
	.fight-hud {
		bottom: calc(max(1.25rem, env(safe-area-inset-bottom)) + 5rem);
	}
</style>
