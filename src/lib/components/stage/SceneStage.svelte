<script lang="ts">
	import type { Snippet } from 'svelte';
	import { BankPalette } from '$lib/game/scene/palette';
	import type { StageConditions } from '$lib/game/sky/stageConditions';
	import type { DeckPlacement } from '$lib/game/stage/orientation.svelte';
	import { lakeLightingFor } from '$lib/game/stage/lakeLighting';
	import LightingOverlays from './LightingOverlays.svelte';
	import SkyCanvas from './SkyCanvas.svelte';
	import StageDeck from './StageDeck.svelte';

	interface Props {
		conditions: StageConditions;
		water: Snippet;
		overTheLake?: Snippet;
		overTheSky?: Snippet;
		belowTheBank?: Snippet;
		deck?: Snippet;
		deckPlacement?: DeckPlacement;
		isImmersive?: boolean;
	}

	let { conditions, water, overTheLake, overTheSky, belowTheBank, deck, deckPlacement = 'below', isImmersive = false }: Props = $props();

	const lighting = $derived(lakeLightingFor(conditions));
	const ground = `linear-gradient(180deg, ${BankPalette.GrassFar}, ${BankPalette.GrassNear})`;
	const isDeckBelow = $derived(deckPlacement === 'below' && deck !== undefined);
	const isDeckBeside = $derived(deckPlacement === 'beside' && deck !== undefined);
</script>

<div class="stage relative flex h-full w-full flex-col overflow-hidden">
	{#if !isImmersive}<SkyCanvas {conditions} layer="backdrop" />{/if}
	<div class="sky short:min-h-10 z-10 min-h-20 shrink-0 bg-gradient-to-b from-carbon-950/45 to-carbon-950/0" class:relative={!isImmersive} class:immersive-sky={isImmersive}>{@render overTheSky?.()}</div>
	<div class="ground relative flex min-h-0" class:flex-1={!isDeckBelow || isImmersive} class:flex-row={isDeckBeside} class:water-band={isDeckBelow && !isImmersive}>
		{#if isImmersive}
			<div class="relative min-h-0 min-w-0 flex-1">{@render water()}</div>
		{:else}
			<div class="water-area relative flex min-h-0 min-w-0 flex-1 items-center justify-center" style="background: {ground}; filter: {lighting.seasonFilter}">
				<div class="lake-frame">{@render water()}</div>
				<LightingOverlays {lighting} />
				<div class="pointer-events-none absolute inset-0 flex items-center justify-center">
					<div class="lake-frame relative">{@render overTheLake?.()}</div>
				</div>
			</div>
		{/if}
		{#if isDeckBeside && deck}<StageDeck {deck} isBeside {isImmersive} />{/if}
	</div>
	{#if isDeckBelow && deck}<StageDeck {deck} isBeside={false} {isImmersive} />{/if}
	{#if belowTheBank}<div class="relative z-10 shrink-0 border-t border-carbon-700 bg-carbon-950/85 backdrop-blur">{@render belowTheBank()}</div>{/if}
	<SkyCanvas {conditions} layer="overhead" />
</div>

<style>
	.stage {
		container-type: size;
	}
	.water-area {
		container-type: size;
		padding: 0.5rem;
	}
	.lake-frame {
		height: min(calc(100cqh - 1rem), calc((100cqw - 1rem) * 2 / 3));
		aspect-ratio: 3 / 2;
	}
	.water-band {
		height: min(calc((100cqw - 1rem) * 2 / 3 + 1rem), 55cqh);
	}
	.immersive-sky {
		position: absolute;
		inset: 0 0 auto 0;
	}
	@media (min-width: 640px) {
		.water-area {
			padding: 0.75rem;
		}
		.lake-frame {
			height: min(calc(100cqh - 1.5rem), calc((100cqw - 1.5rem) * 2 / 3));
		}
		.water-band {
			height: min(calc((100cqw - 1.5rem) * 2 / 3 + 1.5rem), 55cqh);
		}
	}
</style>
