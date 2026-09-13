<script lang="ts">
	import type { LakeLighting } from '$lib/game/stage/lakeLighting';

	let { lighting }: { lighting: LakeLighting } = $props();
</script>

<div class="light pointer-events-none absolute inset-0 mix-blend-soft-light" style="background-color: {lighting.seasonTint}"></div>
<div class="light pointer-events-none absolute inset-0 mix-blend-soft-light" style="background-color: {lighting.glowColour}; opacity: {lighting.glowOpacity}"></div>
<div class="light pointer-events-none absolute inset-0 mix-blend-multiply" style="background-color: {lighting.shadeColour}; opacity: {lighting.shadeOpacity}"></div>

<style>
	.light {
		transition:
			opacity 6s linear,
			background-color 6s linear;
	}
</style>
