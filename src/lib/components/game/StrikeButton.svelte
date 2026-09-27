<script lang="ts">
	import type { ActiveBite } from '$lib/game/session/sessionState.svelte';

	let { bite, onStrike }: { bite: ActiveBite; onStrike: () => void } = $props();

	function strikeOnEnter(event: KeyboardEvent) {
		if (event.key !== 'Enter') return;
		event.preventDefault();
		onStrike();
	}
</script>

<svelte:window onkeydown={strikeOnEnter} />

<button class="fixed inset-0 z-50 flex cursor-pointer flex-col items-center justify-center gap-4 bg-transparent" onclick={onStrike} aria-label="Strike at the bite on rod {bite.rodIndex + 1}">
	<span class="hud-label rounded-full bg-danger-500/85 px-4 py-1.5 text-mist-100">Bite on rod {bite.rodIndex + 1}</span>
	<span class="hud-figure strike-word text-7xl sm:text-9xl">Strike!</span>
	<span class="hud-glass hud-label flex items-center gap-3 px-4 py-2"><kbd class="rounded bg-volt-500 px-2 py-0.5 text-carbon-950">Enter</kbd> or tap to strike · {bite.secondsLeft.toFixed(1)}s</span>
</button>

<style>
	.strike-word {
		animation: strike-pulse 0.5s ease-in-out infinite alternate;
	}
	@keyframes strike-pulse {
		from {
			transform: scale(1);
		}
		to {
			transform: scale(1.06);
		}
	}
</style>
