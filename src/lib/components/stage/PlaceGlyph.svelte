<script lang="ts">
	import type { PlaceId } from '$lib/game/stage/bankPlaces';

	let { kind, size = 28 }: { kind: PlaceId; size?: number } = $props();
</script>

<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
	{#if kind === 'lodge'}
		<path d="M3 11.5 12 4l9 7.5" />
		<path d="M5.5 10.5V20h13v-9.5" />
		<path d="M10 20v-5h4v5" />
		<path d="M15.5 4.5V8" />
	{:else if kind === 'shop'}
		<path d="M3 9.5 4.5 4h15L21 9.5" />
		<path d="M3 9.5c0 1.4 1.1 2.5 2.5 2.5S8 10.9 8 9.5c0 1.4 1.1 2.5 2.5 2.5S13 10.9 13 9.5c0 1.4 1.1 2.5 2.5 2.5S18 10.9 18 9.5c0 1.4 1.1 2.5 2.5 2.5" />
		<path d="M5 12.5V20h14v-7.5" />
		<path d="M9 20v-4.5h6V20" />
	{:else if kind === 'noticeboard'}
		<rect x="3.5" y="4.5" width="17" height="11" rx="1.2" />
		<path d="M8 15.5V20M16 15.5V20" />
		<path d="M7 8h5M7 11.5h8" />
		<circle cx="16.5" cy="8" r="0.6" fill="currentColor" />
	{:else if kind === 'jetty'}
		<path d="M4 20 8.5 6h7L20 20" />
		<path d="M7.2 10h9.6M6.2 13.5h11.6M5.2 17h13.6" />
		<path d="M3 20h18" />
	{:else}
		<path d="M12 3v18" />
		<path d="M12 6h6.5l2 2-2 2H12z" />
		<path d="M12 12H5.5l-2 2 2 2H12z" />
		<path d="M9 21h6" />
	{/if}
</svg>
