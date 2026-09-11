<script lang="ts">
	import { TensionBand } from '$lib/domain/fishing/fight';
	import type { FightState } from '$lib/game/session/fightState.svelte';
	import { formatWeight } from '$lib/format/weight';

	let { fight, onFinished }: { fight: FightState; onFinished: () => void } = $props();

	$effect(() => {
		let handle = 0;
		let last = performance.now();
		const start = last;
		const frame = (now: number) => {
			fight.advance(Math.min(0.1, (now - last) / 1000), (now - start) / 1000);
			last = now;
			if (fight.outcome) return onFinished();
			handle = requestAnimationFrame(frame);
		};
		handle = requestAnimationFrame(frame);
		return () => cancelAnimationFrame(handle);
	});

	const startReeling = () => (fight.isReeling = true);
	const stopReeling = () => (fight.isReeling = false);
	const handleKey = (event: KeyboardEvent, isDown: boolean) => {
		if (event.code !== 'Space') return;
		event.preventDefault();
		fight.isReeling = isDown;
	};
</script>

<svelte:window onkeydown={(event) => handleKey(event, true)} onkeyup={(event) => handleKey(event, false)} />

<section class="panel space-y-4">
	<h3 class="text-xl text-gold-300">Fish on! Something around {formatWeight(Math.round(Number(fight.carp.weight_lb) / 5) * 5)}</h3>
	<div class="relative h-8 overflow-hidden rounded-full bg-pond-950">
		<div class="absolute inset-y-0 bg-reed-500/40" style="left: {TensionBand.SlackBelow * 100}%; width: {(TensionBand.SnapAbove - TensionBand.SlackBelow) * 100}%"></div>
		<div class="absolute inset-y-0 w-1.5 rounded-full bg-gold-300 transition-[left] duration-75" style="left: calc({fight.tension * 100}% - 3px)"></div>
	</div>
	<div class="flex justify-between text-xs text-mist-400"><span>Slack — hook falls out</span><span>Tight — line snaps</span></div>
	<button
		class="w-full select-none rounded-xl px-4 py-4 text-lg font-bold transition"
		class:bg-gold-500={fight.isReeling}
		class:text-pond-950={fight.isReeling}
		class:bg-pond-700={!fight.isReeling}
		onmousedown={startReeling}
		onmouseup={stopReeling}
		onmouseleave={stopReeling}
		ontouchstart={startReeling}
		ontouchend={stopReeling}>Hold to reel (or hold Space)</button
	>
	<p class="text-center text-sm text-mist-400">{Math.ceil(fight.secondsRemaining)}s until it's in the net</p>
</section>
