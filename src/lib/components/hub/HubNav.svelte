<script lang="ts">
	import type { Lake } from '$lib/domain/types';
	import { HubDoors, runFisheryDoorFor } from '$lib/game/navigation/hubDoors';
	import DoorGlyph from './DoorGlyph.svelte';
	import HubDoorLink from './HubDoorLink.svelte';
	import PinYourWaterLine from './PinYourWaterLine.svelte';

	let { lake, worksInProgress }: { lake: Lake; worksInProgress: number } = $props();

	const runFishery = $derived(runFisheryDoorFor(lake.is_setup_complete));
	const isUnpinned = $derived(lake.latitude === null);
	const fishingWords = $derived(lake.is_setup_complete ? 'Fish my lake' : 'Not open yet');
</script>

<nav class="short:py-1.5 short:gap-1.5 mx-auto flex max-w-5xl flex-col gap-1.5 px-3 py-2 sm:gap-2 sm:px-4 sm:py-3" aria-label="Around the fishery">
	{#if isUnpinned}<PinYourWaterLine lakeName={lake.name} />{/if}
	<div class="grid grid-cols-2 gap-1.5 sm:grid-cols-5 sm:gap-2">
		<form method="POST" action="/fish/{lake.id}?/buyTicket" class="col-span-2 flex sm:col-span-1">
			<button class="hub-door hub-door-primary w-full" disabled={!lake.is_setup_complete}>
				<DoorGlyph kind="fish_my_lake" />
				<span>{fishingWords}</span>
			</button>
		</form>
		<HubDoorLink door={runFishery} badge={worksInProgress} />
		{#each HubDoors as door (door.id)}
			<HubDoorLink {door} />
		{/each}
	</div>
</nav>
