<script lang="ts">
	import type { Snippet } from 'svelte';

	let { children, isWide = false }: { children: Snippet; isWide?: boolean } = $props();
</script>

<div class="screen-overlay fixed inset-0 z-50 flex overflow-y-auto bg-carbon-950/60 p-3 backdrop-blur-[2px] sm:p-4">
	<div class="m-auto w-full" class:max-w-xl={!isWide} class:max-w-5xl={isWide}>
		{@render children()}
	</div>
</div>

<style>
	.screen-overlay {
		padding-top: max(0.75rem, env(safe-area-inset-top));
		padding-bottom: max(0.75rem, env(safe-area-inset-bottom));
	}
</style>
