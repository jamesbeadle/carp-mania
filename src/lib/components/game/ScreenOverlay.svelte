<script lang="ts">
	import type { Snippet } from 'svelte';

	let { children }: { children: Snippet } = $props();
</script>

<div class="screen-overlay fixed inset-0 z-50 flex overflow-y-auto bg-carbon-950/60 p-3 backdrop-blur-[2px] sm:p-4">
	<div class="m-auto w-full max-w-xl">
		{@render children()}
	</div>
</div>

<style>
	.screen-overlay {
		padding-top: max(0.75rem, env(safe-area-inset-top));
		padding-bottom: max(0.75rem, env(safe-area-inset-bottom));
	}
</style>
