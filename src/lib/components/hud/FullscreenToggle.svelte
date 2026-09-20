<script lang="ts">
	import { fullscreen } from '$lib/game/stage/fullscreen.svelte';

	$effect(() => fullscreen.watch());

	const label = $derived(fullscreen.isFullscreen ? 'Leave fullscreen' : 'Go fullscreen');
</script>

{#if fullscreen.isSupported}
	<button class="flex h-9 w-9 items-center justify-center rounded-full border border-carbon-600 bg-carbon-900/80 text-mist-200 transition hover:border-volt-400 hover:text-volt-300 active:scale-95" onclick={() => fullscreen.toggle()} aria-label={label} title={label} aria-pressed={fullscreen.isFullscreen}>
		<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
			{#if fullscreen.isFullscreen}
				<path d="M9 4v5H4M15 4v5h5M9 20v-5H4M15 20v-5h5" />
			{:else}
				<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" />
			{/if}
		</svg>
	</button>
{/if}
