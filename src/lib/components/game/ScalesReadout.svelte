<script lang="ts">
	import { formatWeight } from '$lib/format/weight';
	import { sound } from '$lib/game/sound/soundEngine.svelte';

	let { weightLb, onSettled }: { weightLb: number; onSettled: () => void } = $props();

	const Scales = { Seconds: 1.7, TickEveryMilliseconds: 65 } as const;

	let shownLb = $state(0);
	let isSettled = $state(false);

	const easeOut = (progress: number) => 1 - Math.pow(1 - progress, 3);

	$effect(() => {
		let handle = 0;
		let lastTickAt = 0;
		const start = performance.now();
		const frame = (now: number) => {
			const progress = Math.min(1, (now - start) / (Scales.Seconds * 1000));
			shownLb = weightLb * easeOut(progress);
			if (now - lastTickAt > Scales.TickEveryMilliseconds && progress < 1) {
				sound.play('scales_tick');
				lastTickAt = now;
			}
			if (progress < 1) return void (handle = requestAnimationFrame(frame));
			settle();
		};
		handle = requestAnimationFrame(frame);
		return () => cancelAnimationFrame(handle);
	});

	function settle() {
		shownLb = weightLb;
		isSettled = true;
		sound.play('scales_settle');
		onSettled();
	}
</script>

<div class="rounded-2xl border border-carbon-600 bg-carbon-950 px-6 py-3 text-center" class:settled={isSettled}>
	<p class="stat-label">{isSettled ? 'Weighed' : 'On the scales'}</p>
	<p class="font-display text-5xl font-extrabold tracking-wide text-volt-300 tabular-nums italic sm:text-6xl">{formatWeight(shownLb)}</p>
</div>

<style>
	.settled {
		animation: settle-glow 0.9s ease-out;
	}
	@keyframes settle-glow {
		0% {
			box-shadow: 0 0 0 0 rgba(62, 232, 58, 0.55);
		}
		100% {
			box-shadow: 0 0 40px 12px rgba(62, 232, 58, 0);
		}
	}
</style>
