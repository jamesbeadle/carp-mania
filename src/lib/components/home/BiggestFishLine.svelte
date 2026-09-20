<script lang="ts">
	import type { BiggestFishInTheGame } from '$lib/contracts/BiggestFish';
	import { formatWeight } from '$lib/format/weight';

	let { fish }: { fish: BiggestFishInTheGame | null } = $props();

	const words = $derived(fish ? lineFor(fish) : '');

	function lineFor(biggest: BiggestFishInTheGame) {
		const { carpName, weightLb, lakeName, isOpen } = biggest;
		const openWords = isOpen ? '' : ' — not open to anglers';
		return `The biggest fish in the game: ${carpName}, ${formatWeight(weightLb)}, at ${lakeName}${openWords}`;
	}
</script>

{#if fish}
	<a href="/carp/{fish.carpId}" class="pointer-events-auto rounded-full bg-carbon-950/45 px-3 py-1 text-xs text-mist-200 backdrop-blur hover:text-volt-300">{words}</a>
{/if}
