<script lang="ts">
	import { sound } from '$lib/game/sound/soundEngine.svelte';

	const label = $derived(sound.isMuted ? 'Sound off — turn on' : 'Sound on — turn off');
</script>

<div class="flex items-center gap-2">
	<button class="flex h-9 w-9 items-center justify-center rounded-full border border-carbon-600 bg-carbon-900/80 transition hover:border-volt-400 active:scale-95" class:text-mist-400={sound.isMuted} class:text-volt-300={!sound.isMuted} onclick={() => sound.toggleMute()} aria-label={label} aria-pressed={!sound.isMuted}>
		<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
			<path d="M4 9.5v5h3.5L12 18.5v-13L7.5 9.5z" />
			{#if sound.isMuted}
				<path d="M16 9.5l5 5M21 9.5l-5 5" />
			{:else}
				<path d="M15.5 9a4 4 0 0 1 0 6M18.5 6.5a8 8 0 0 1 0 11" />
			{/if}
		</svg>
	</button>
	<input type="range" min="0" max="1" step="0.05" value={sound.volume} oninput={(event) => sound.setVolume(Number(event.currentTarget.value))} class="hidden w-16 accent-volt-500 lg:block" aria-label="Volume" />
</div>
