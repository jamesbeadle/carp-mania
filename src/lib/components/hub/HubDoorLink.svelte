<script lang="ts">
	import type { HubDoor } from '$lib/game/navigation/hubDoors';
	import DoorGlyph from './DoorGlyph.svelte';

	let { door, badge = 0 }: { door: HubDoor; badge?: number } = $props();
</script>

<a href={door.href} class="hub-door" data-sveltekit-preload-data="tap">
	<span class="relative">
		<DoorGlyph kind={door.id} />
		{#if badge > 0}
			<span class="absolute -top-2 -right-2.5 min-w-5 rounded-full bg-volt-500 px-1.5 py-0.5 text-center text-[11px] leading-none font-bold not-italic text-carbon-950" title="{badge} on the go">{badge}</span>
		{/if}
	</span>
	<span>{door.label}</span>
</a>
