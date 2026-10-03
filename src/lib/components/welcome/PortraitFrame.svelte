<script lang="ts">
	import type { PortraitLook } from '$lib/domain/portrait/portraitLook';
	import { drawPortrait } from '$lib/game/portrait/drawPortrait';

	let { look, size = 'h-40 w-40' }: { look: PortraitLook; size?: string } = $props();

	const portrait = $derived(drawPortrait(look));
</script>

<div class="portrait {size} shrink-0 overflow-hidden rounded-full border-4 border-volt-500 shadow-volt" aria-label="Your angler's portrait" role="img">
	{@html portrait}
</div>

<style>
	.portrait :global(svg) {
		display: block;
		width: 100%;
		height: 100%;
	}
</style>
