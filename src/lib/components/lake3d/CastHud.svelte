<script lang="ts">
	import type { CastControl } from '$lib/game/lake3d/stage/castControl.svelte';

	let { cast, isReady }: { cast: CastControl; isReady: boolean } = $props();

	const PercentScale = 100;
	const ProblemWords = { on_the_bank: 'That lands on the bank', through_an_island: 'The island is in the way' } as const;
	const problemWords = $derived(cast.problem ? ProblemWords[cast.problem] : null);
</script>

{#if cast.isAiming}
	<div class="hud-glass pointer-events-none absolute top-4 left-1/2 w-[min(36rem,calc(100%-2rem))] -translate-x-1/2 px-5 py-3">
		<div class="flex items-baseline justify-between gap-3">
			<span class="hud-label">Cast</span>
			<span class="hud-label" class:text-danger-400={problemWords !== null}>{problemWords ?? 'Release to cast · ← → to aim'}</span>
			<span class="font-display text-xl text-volt-300 tabular-nums">{cast.yardsOut}<span class="text-sm text-mist-400"> / {cast.yardsReach} yd</span></span>
		</div>
		<div class="mt-2 h-3 overflow-hidden rounded-full bg-carbon-950/80">
			<div class="h-full rounded-full bg-gradient-to-r from-volt-500 to-surge-500 transition-[width] duration-75" style="width: {cast.aim.power * PercentScale}%"></div>
		</div>
	</div>
{:else if isReady}
	<p class="hud-glass hud-label pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 text-center whitespace-nowrap">Drag down to load the rod, let go to cast · or hold Space</p>
{/if}
