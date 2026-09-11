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

<svelte:window onkeydown={(event) => handleKey(event, true)} onkeyup={(event) => handleKey(event, false)} onblur={stopReeling} />

<section class="panel space-y-4">
	<h3 class="text-xl text-volt-300">Fish on! Something around {formatWeight(Math.round(Number(fight.carp.weight_lb) / 5) * 5)}</h3>
	<p class="rounded-md px-3 py-2 text-center font-display text-lg font-bold tracking-wide uppercase" class:bg-danger-500={fight.isRunning} class:text-mist-100={fight.isRunning} class:bg-carbon-900={!fight.isRunning} class:text-volt-300={!fight.isRunning}>
		{fight.isRunning ? 'It\'s running — let go and let it take line' : 'It\'s tiring — hold to reel'}
	</p>
	<div class="relative h-8 overflow-hidden rounded-full bg-carbon-950">
		<div class="absolute inset-y-0 bg-gradient-to-r from-volt-500/50 via-surge-500/40 to-volt-500/50" style="left: {TensionBand.SlackBelow * 100}%; width: {(TensionBand.SnapAbove - TensionBand.SlackBelow) * 100}%"></div>
		<div class="absolute inset-y-0 w-1.5 rounded-full bg-volt-300 transition-[left] duration-75" style="left: calc({fight.tension * 100}% - 3px)"></div>
	</div>
	<div class="flex justify-between text-xs text-mist-400"><span>Slack — hook falls out</span><span>Tight — line snaps</span></div>
	<button
		class="button-primary w-full touch-none select-none py-5 text-2xl"
		class:bg-volt-300={fight.isReeling}
		onpointerdown={startReeling}
		onpointerup={stopReeling}
		onpointerleave={stopReeling}
		onpointercancel={stopReeling}
		oncontextmenu={(event) => event.preventDefault()}>{fight.isReeling ? 'Reeling…' : 'Hold to reel'}</button
	>
	<p class="text-center text-sm text-mist-400">{Math.ceil(fight.secondsRemaining)}s until it's in the net</p>
</section>
