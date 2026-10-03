<script lang="ts">
	import type { Snippet } from 'svelte';
	import MeshBackdrop from '../brand/MeshBackdrop.svelte';

	let { children }: { children: Snippet } = $props();
</script>

<div class="scene fixed inset-0 z-40 overflow-x-hidden overflow-y-auto overscroll-contain">
	<div class="pointer-events-none fixed inset-x-0 bottom-0 h-1/2"><MeshBackdrop opacity={0.3} /></div>
	<div class="relative mx-auto flex min-h-dvh w-full max-w-6xl flex-col justify-center px-4 py-8">{@render children()}</div>
</div>

<style>
	.scene {
		padding-top: env(safe-area-inset-top);
		padding-bottom: env(safe-area-inset-bottom);
		background:
			radial-gradient(ellipse at 50% 120%, rgba(31, 211, 255, 0.18), transparent 60%),
			radial-gradient(ellipse at 50% -10%, rgba(62, 232, 58, 0.12), transparent 55%),
			var(--color-carbon-950);
	}
</style>
