<script lang="ts">
	let { isIn3d = $bindable(), flatLabel = 'Map' }: { isIn3d: boolean; flatLabel?: string } = $props();
</script>

<button class="hud-glass hud-label absolute bottom-3 left-3 z-20 px-3 py-2 hover:text-volt-300" onclick={() => (isIn3d = !isIn3d)} aria-label={isIn3d ? `Show the ${flatLabel.toLowerCase()}` : 'Show the lake in 3D'}>{isIn3d ? flatLabel : '3D'}</button>
