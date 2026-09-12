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

<div class="pointer-events-auto absolute inset-0 flex items-center justify-center">
	<button
		class="animate-pulse rounded-full border-4 border-danger-400 bg-danger-500 px-8 py-6 font-display text-4xl font-extrabold tracking-wide text-mist-100 uppercase italic shadow-2xl shadow-danger-500/50 active:scale-95 sm:px-12 sm:py-8 sm:text-5xl"
		onclick={onStrike}>Strike!<span class="block text-lg font-bold not-italic">Rod {bite.rodIndex + 1} · {bite.secondsLeft.toFixed(1)}s</span></button
	>
</div>
