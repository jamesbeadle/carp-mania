<script lang="ts">
	import type { TabId } from '$lib/game/navigation/mainTabs';

	let { kind, size = 24 }: { kind: TabId; size?: number } = $props();
</script>

<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
	{#if kind === 'lake'}
		<path d="M3 9c2-1.5 4-1.5 6 0s4 1.5 6 0 4-1.5 6 0" />
		<path d="M3 14c2-1.5 4-1.5 6 0s4 1.5 6 0 4-1.5 6 0" />
		<path d="M3 19c2-1.5 4-1.5 6 0s4 1.5 6 0 4-1.5 6 0" />
	{:else if kind === 'fish'}
		<path d="M3 12c3-4.5 7.5-6 12-4l3.5-3v14L15 16c-4.5 2-9 .5-12-4z" />
		<circle cx="8" cy="11" r="0.9" fill="currentColor" />
		<path d="M12 8.5c1.5 2 1.5 5 0 7" />
	{:else if kind === 'world'}
		<circle cx="12" cy="12" r="9" />
		<path d="M3 12h18M12 3c3 3.2 3 14.8 0 18M12 3c-3 3.2-3 14.8 0 18" />
	{:else if kind === 'market'}
		<path d="M4 8h16l-1.5 11h-13z" />
		<path d="M9 8V6a3 3 0 0 1 6 0v2" />
		<path d="M9.5 13.5h5" />
	{:else}
		<path d="M4 20c0-4 3.6-6.5 8-6.5s8 2.5 8 6.5" />
		<circle cx="12" cy="8" r="4" />
		<path d="M6 9c1-3 3.5-4.5 6-4.5S17 6 18 9" />
	{/if}
</svg>
