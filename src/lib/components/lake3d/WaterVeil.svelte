<script lang="ts">
	import { fade } from 'svelte/transition';
	import MeshBackdrop from '../brand/MeshBackdrop.svelte';

	const Veil = { FadeMilliseconds: 500, MeshOpacity: 0.3 } as const;
</script>

<div class="absolute inset-0 z-10 bg-carbon-950" out:fade|global={{ duration: Veil.FadeMilliseconds }} role="status" aria-live="polite" aria-label="Building your water">
	<MeshBackdrop opacity={Veil.MeshOpacity} rows={12} columns={30} />
	<div class="hud-glass absolute top-1/2 left-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-3 px-6 py-4">
		<p class="hud-label">Building your water…</p>
		<div class="veil-track h-0.5 w-40 overflow-hidden rounded-full bg-mist-100/10"><div class="veil-sweep h-full w-1/3 rounded-full bg-volt-500"></div></div>
	</div>
</div>

<style>
	.veil-sweep {
		animation: sweep 1.4s ease-in-out infinite;
		box-shadow: 0 0 12px rgba(62, 232, 58, 0.55);
	}
	@keyframes sweep {
		from {
			transform: translateX(-100%);
		}
		to {
			transform: translateX(300%);
		}
	}
</style>
