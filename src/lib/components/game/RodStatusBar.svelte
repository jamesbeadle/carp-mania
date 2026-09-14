<script lang="ts">
	import type { RodOnBank } from '$lib/game/scene/rodState';
	import RodCard from './RodCard.svelte';

	let { rods, isDocked = false, onReelIn }: { rods: RodOnBank[]; isDocked?: boolean; onReelIn?: (rodIndex: number) => void } = $props();

	const RodKeys = ['1', '2', '3'];

	function reelInOnNumber(event: KeyboardEvent) {
		const rodIndex = RodKeys.indexOf(event.key);
		if (rodIndex === -1 || event.target instanceof HTMLInputElement) return;
		onReelIn?.(rodIndex);
	}
</script>

<svelte:window onkeydown={reelInOnNumber} />

<div class={['pointer-events-none gap-2', isDocked ? 'flex flex-col' : 'absolute bottom-3 left-3 flex flex-wrap']}>
	{#each rods as rod (rod.index)}
		<RodCard {rod} {isDocked} {onReelIn} />
	{/each}
</div>
