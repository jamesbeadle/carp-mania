<script lang="ts">
	import { NightColour, type LakeLighting } from '$lib/game/stage/lakeLighting';

	let { lighting }: { lighting: LakeLighting } = $props();
</script>

<div class="pointer-events-none absolute inset-0 mix-blend-soft-light" style="background: {lighting.seasonTint}"></div>
<div class="pointer-events-none absolute inset-0 mix-blend-soft-light" style="background: {lighting.glowColour}; opacity: {lighting.glowOpacity}"></div>
<div class="pointer-events-none absolute inset-0 mix-blend-multiply" style="background: {NightColour}; opacity: {lighting.nightOpacity}"></div>
