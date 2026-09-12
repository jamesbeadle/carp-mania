<script lang="ts">
	import type { Snippet } from 'svelte';
	import { BankPalette } from '$lib/game/scene/palette';
	import type { StageConditions } from '$lib/game/sky/stageConditions';
	import { lakeLightingFor } from '$lib/game/stage/lakeLighting';
	import LightingOverlays from './LightingOverlays.svelte';
	import SkyCanvas from './SkyCanvas.svelte';

	interface Props {
		conditions: StageConditions;
		water: Snippet;
		overTheLake?: Snippet;
		overTheSky?: Snippet;
	}

	let { conditions, water, overTheLake, overTheSky }: Props = $props();

	const lighting = $derived(lakeLightingFor(conditions));
	const ground = `linear-gradient(180deg, ${BankPalette.GrassFar}, ${BankPalette.GrassNear})`;
</script>

<div class="stage relative flex h-full w-full flex-col overflow-hidden">
	<SkyCanvas {conditions} layer="backdrop" />
	<div class="relative flex-1">{@render overTheSky?.()}</div>
	<div class="relative" style="background: {ground}; filter: {lighting.seasonFilter}">
		<div class="flex justify-center px-2 pt-3 pb-4">
			<div class="lake-frame">{@render water()}</div>
		</div>
		<LightingOverlays {lighting} />
		<div class="pointer-events-none absolute inset-0 flex justify-center px-2 pt-3 pb-4">
			<div class="lake-frame relative">{@render overTheLake?.()}</div>
		</div>
	</div>
	<SkyCanvas {conditions} layer="overhead" />
</div>

<style>
	.stage {
		container-type: size;
	}
	.lake-frame {
		height: min(76cqh, 64cqw);
		aspect-ratio: 3 / 2;
	}
</style>
