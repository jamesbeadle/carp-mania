<script lang="ts">
	import type { ReelInput } from '$lib/game/session/reelInput.svelte';

	let { reel }: { reel: ReelInput } = $props();
</script>

<button
	class="reel-zone button-primary w-full touch-none select-none text-2xl"
	class:bg-volt-300={reel.isReeling}
	onpointerdown={(event) => reel.press(event)}
	onpointerup={() => reel.release()}
	onpointercancel={() => reel.release()}
	onlostpointercapture={() => reel.release()}
	oncontextmenu={(event) => event.preventDefault()}>{reel.isReeling ? 'Reeling…' : 'Hold to reel'}</button
>

<style>
	.reel-zone {
		min-height: 38vh;
	}
	@media (pointer: fine) {
		.reel-zone {
			min-height: 9rem;
		}
	}
</style>
