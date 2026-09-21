<script lang="ts">
	import { isCastingNext, type RodOnBank } from '$lib/game/scene/rodState';
	import RodCard from './RodCard.svelte';

	let { rods, isWide = false, onReelIn }: { rods: RodOnBank[]; isWide?: boolean; onReelIn?: (rodIndex: number) => void } = $props();

	const RodKeys = ['1', '2', '3'];

	function reelInOnNumber(event: KeyboardEvent) {
		const rodIndex = RodKeys.indexOf(event.key);
		if (rodIndex === -1 || event.target instanceof HTMLInputElement) return;
		onReelIn?.(rodIndex);
	}
</script>

<svelte:window onkeydown={reelInOnNumber} />

<div class="flex flex-col gap-2">
	{#each rods as rod (rod.index)}
		<RodCard {rod} isCastingNext={isCastingNext(rod, rods)} {isWide} {onReelIn} />
	{/each}
</div>
