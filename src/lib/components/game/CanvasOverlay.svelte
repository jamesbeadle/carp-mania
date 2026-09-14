<script lang="ts">
	import type { Snippet } from 'svelte';

	type Placement = 'over_the_lake' | 'over_the_screen';

	let { children, placement = 'over_the_lake' }: { children: Snippet; placement?: Placement } = $props();

	const isOverTheScreen = $derived(placement === 'over_the_screen');
</script>

<div class={['pointer-events-auto flex overflow-y-auto bg-carbon-950/40 p-3 backdrop-blur-[2px] sm:p-4', isOverTheScreen ? 'screen-overlay fixed inset-0 z-50 bg-carbon-950/60' : 'absolute inset-0']}>
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
