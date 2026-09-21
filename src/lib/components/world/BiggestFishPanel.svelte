<script lang="ts">
	import type { BiggestFishInTheGame } from '$lib/contracts/BiggestFish';
	import { formatWeight } from '$lib/format/weight';

	let { biggestFish }: { biggestFish: BiggestFishInTheGame | null } = $props();
</script>

{#if biggestFish}
	<section class="panel flex flex-wrap items-baseline gap-2">
		<span class="stat-label">The biggest fish in the game</span>
		<a href="/carp/{biggestFish.carpId}" class="text-lg text-volt-300 hover:underline">{biggestFish.carpName}, {formatWeight(biggestFish.weightLb)}</a>
		<a href="/lakes/{biggestFish.lakeId}" class="text-sm text-mist-400 hover:text-mist-100">at {biggestFish.lakeName}{biggestFish.isOpen ? '' : ' — not open to anglers'}</a>
	</section>
{/if}
