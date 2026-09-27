<script lang="ts">
	import type { Snippet } from 'svelte';

	let { deck, isBeside, isImmersive }: { deck: Snippet; isBeside: boolean; isImmersive: boolean } = $props();
</script>

{#if isBeside}
	<div class="deck deck-beside z-10 min-h-0 shrink-0 overflow-y-auto border-l border-carbon-700 backdrop-blur" class:deck-solid={!isImmersive} class:deck-floating={isImmersive}>{@render deck()}</div>
{:else}
	<div class:deck-under-immersion={isImmersive} class="deck relative z-10 min-h-0 flex-1 overflow-y-auto border-t border-carbon-700 bg-carbon-950/85 backdrop-blur">{@render deck()}</div>
{/if}

<style>
	.deck {
		padding-bottom: env(safe-area-inset-bottom);
	}
	.deck-beside {
		width: min(24rem, 40cqw);
	}
	.deck-solid {
		position: relative;
		background: rgb(6 8 6 / 0.85);
	}
	.deck-floating {
		position: absolute;
		inset: 0 0 0 auto;
		background: rgb(6 8 6 / 0.5);
	}
	.deck-under-immersion {
		flex: none;
		max-height: 38cqh;
	}
	@media (min-width: 1536px) {
		.deck-beside {
			width: min(27rem, 40cqw);
		}
	}
</style>
