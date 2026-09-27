<script lang="ts">
	import type { ReelInput } from '$lib/game/session/reelInput.svelte';

	let { reel }: { reel: ReelInput } = $props();
</script>

<button
	class="reel-zone fixed inset-x-0 bottom-0 z-40 flex touch-none items-end justify-center select-none"
	onpointerdown={(event) => reel.press(event)}
	onpointerup={() => reel.release()}
	onpointercancel={() => reel.release()}
	onlostpointercapture={() => reel.release()}
	oncontextmenu={(event) => event.preventDefault()}
	aria-label="Hold to reel"
>
	<span class="hud-glass mb-[max(1.25rem,env(safe-area-inset-bottom))] px-8 py-4 font-display text-2xl font-extrabold tracking-wide uppercase italic transition" class:text-volt-300={!reel.isReeling} class:text-carbon-950={reel.isReeling} class:bg-volt-400={reel.isReeling}>{reel.isReeling ? 'Reeling…' : 'Hold to reel'}</span>
</button>

<style>
	.reel-zone {
		height: 45vh;
	}
	@media (pointer: fine) {
		.reel-zone {
			height: auto;
		}
	}
</style>
