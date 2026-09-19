<script lang="ts">
	import type { BiggestFishInTheGame } from '$lib/contracts/BiggestFish';
	import type { BountyCard as OpenBounty } from '$lib/contracts/Bounties';
	import { formatWeight } from '$lib/format/weight';
	import BountyCard from './BountyCard.svelte';

	let { bounties, biggestFish }: { bounties: OpenBounty[]; biggestFish: BiggestFishInTheGame | null } = $props();
</script>

{#if biggestFish}
	<section class="panel flex flex-wrap items-baseline gap-2">
		<span class="stat-label">The biggest fish in the game</span>
		<a href="/carp/{biggestFish.carpId}" class="text-lg text-volt-300 hover:underline">{biggestFish.carpName}, {formatWeight(biggestFish.weightLb)}</a>
		<a href="/lakes/{biggestFish.lakeId}" class="text-sm text-mist-400 hover:text-mist-100">at {biggestFish.lakeName}{biggestFish.isOpen ? '' : ' — not open to anglers'}</a>
	</section>
{/if}
{#if bounties.length > 0}
	<section>
		<h2 class="mb-2 text-xl text-volt-300">Bounties on the water</h2>
		<div class="grid gap-3 sm:grid-cols-2">
			{#each bounties as bounty (bounty.id)}<BountyCard {bounty} />{/each}
		</div>
	</section>
{/if}
