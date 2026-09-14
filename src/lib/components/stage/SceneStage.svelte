<script lang="ts">
	import type { Snippet } from 'svelte';
	import { BankPalette } from '$lib/game/scene/palette';
	import type { StageConditions } from '$lib/game/sky/stageConditions';
	import type { DeckPlacement } from '$lib/game/stage/orientation.svelte';
	import { lakeLightingFor } from '$lib/game/stage/lakeLighting';
	import LightingOverlays from './LightingOverlays.svelte';
	import SkyCanvas from './SkyCanvas.svelte';

	interface Props {
		conditions: StageConditions;
		water: Snippet;
		overTheLake?: Snippet;
		overTheSky?: Snippet;
		belowTheBank?: Snippet;
		deck?: Snippet;
		deckPlacement?: DeckPlacement;
	}

	let { conditions, water, overTheLake, overTheSky, belowTheBank, deck, deckPlacement = 'none' }: Props = $props();

	const lighting = $derived(lakeLightingFor(conditions));
	const ground = `linear-gradient(180deg, ${BankPalette.GrassFar}, ${BankPalette.GrassNear})`;
	const isDeckBelow = $derived(deckPlacement === 'below' && deck !== undefined);
	const isDeckBeside = $derived(deckPlacement === 'beside' && deck !== undefined);
	const hasDeck = $derived(isDeckBelow || isDeckBeside);
	const hasBar = $derived(belowTheBank !== undefined);
	const isLakeShortened = $derived(hasBar || isDeckBelow);
</script>

<div class="stage relative flex h-full w-full flex-col overflow-hidden">
	<SkyCanvas {conditions} layer="backdrop" />
	<div class={['relative', !hasDeck && 'flex-1', hasBar && 'short:min-h-18 min-h-28', isDeckBelow && 'min-h-36', isDeckBeside && 'min-h-16']}>{@render overTheSky?.()}</div>
	<div class="relative flex" class:min-h-0={isDeckBeside} class:flex-1={isDeckBeside} class:flex-row={isDeckBeside} class:flex-col={!isDeckBeside} style="background: {ground}; filter: {lighting.seasonFilter}">
		<div class="relative flex justify-center px-2 pt-3 pb-4">
			<div class="lake-frame" class:shortened={isLakeShortened}>{@render water()}</div>
			<LightingOverlays {lighting} />
			<div class="pointer-events-none absolute inset-0 flex justify-center px-2 pt-3 pb-4">
				<div class="lake-frame relative" class:shortened={isLakeShortened}>{@render overTheLake?.()}</div>
			</div>
		</div>
		{#if isDeckBeside}<div class="deck relative min-w-0 flex-1 overflow-y-auto bg-carbon-950/85 backdrop-blur">{@render deck?.()}</div>{/if}
	</div>
	{#if isDeckBelow}<div class="deck relative min-h-0 flex-1 overflow-y-auto bg-carbon-950/85 backdrop-blur">{@render deck?.()}</div>{/if}
	{#if hasBar}<div class="relative shrink-0 border-t border-carbon-700 bg-carbon-950/85 backdrop-blur">{@render belowTheBank?.()}</div>{/if}
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
	.lake-frame.shortened {
		height: min(58cqh, 64cqw);
	}
	@container (max-height: 640px) {
		.lake-frame.shortened {
			height: min(34cqh, 64cqw);
		}
	}
	@media (max-height: 500px) {
		.lake-frame.shortened {
			height: min(30cqh, 64cqw);
		}
	}
	.deck {
		padding-bottom: env(safe-area-inset-bottom);
	}
</style>
