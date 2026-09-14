<script lang="ts">
	import type { HubDoorId } from '$lib/game/navigation/hubDoors';

	let { kind, size = 24 }: { kind: HubDoorId; size?: number } = $props();
</script>

<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
	{#if kind === 'fish_my_lake'}
		<path d="M3 12c3-4.5 7.5-6 12-4l3.5-3v14L15 16c-4.5 2-9 .5-12-4z" />
		<circle cx="8" cy="11" r="0.9" fill="currentColor" />
		<path d="M12 8.5c1.5 2 1.5 5 0 7" />
	{:else if kind === 'run_fishery'}
		<path d="M3 11.5 12 4l9 7.5" />
		<path d="M5.5 10.5V20h13v-9.5" />
		<path d="M10 20v-5h4v5" />
		<path d="M15.5 4.5V8" />
	{:else if kind === 'find_water'}
		<path d="M4 20 8.5 6h7L20 20" />
		<path d="M7.2 10h9.6M6.2 13.5h11.6M5.2 17h13.6" />
		<path d="M3 20h18" />
	{:else if kind === 'matches'}
		<path d="M7 4h10v5a5 5 0 0 1-10 0z" />
		<path d="M7 6H4.5a2.5 2.5 0 0 0 0 5H7M17 6h2.5a2.5 2.5 0 0 1 0 5H17" />
		<path d="M12 14v3.5M8.5 20.5h7M9.5 17.5h5v3h-5z" />
	{:else}
		<path d="M3 9.5 4.5 4h15L21 9.5" />
		<path d="M3 9.5c0 1.4 1.1 2.5 2.5 2.5S8 10.9 8 9.5c0 1.4 1.1 2.5 2.5 2.5S13 10.9 13 9.5c0 1.4 1.1 2.5 2.5 2.5S18 10.9 18 9.5c0 1.4 1.1 2.5 2.5 2.5" />
		<path d="M5 12.5V20h14v-7.5" />
		<path d="M9 20v-4.5h6V20" />
	{/if}
</svg>
