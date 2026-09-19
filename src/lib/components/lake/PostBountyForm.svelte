<script lang="ts">
	import { BountyDraw, NamedFishFromLb, OwnersBounty } from '$lib/domain/bounties/bountyDraw';
	import { BountyKindCatalogue, BountyKinds, type BountyKind } from '$lib/domain/bounties/bountyKinds';
	import type { Carp } from '$lib/domain/types';
	import { formatWeight } from '$lib/format/weight';

	let { carp }: { carp: Carp[] } = $props();

	let kind = $state<BountyKind>('top_of_the_water');
	let money = $state(OwnersBounty.LeastMoney);
	let days = $state(BountyDraw.ShortestWindowDays);
	const namedFish = $derived(carp.filter((fish) => fish.is_catalogued && Number(fish.weight_lb) >= NamedFishFromLb));
	const isNamed = $derived(kind === 'named_fish');
	const canPost = $derived(!isNamed || namedFish.length > 0);
	const fishWords = (fish: Carp) => `${fish.name} · ${formatWeight(fish.weight_lb)}`;
</script>

<form method="POST" action="?/postBounty" class="space-y-3">
	<p class="text-sm text-mist-400">Put your own money on the water — the cheapest way to fill a quiet week. From £{OwnersBounty.LeastMoney}, for {BountyDraw.ShortestWindowDays} to {BountyDraw.LongestWindowDays} days.</p>
	<div class="flex flex-wrap items-end gap-3">
		<label class="text-xs text-mist-400">What wins it
			<select name="kind" bind:value={kind} class="field mt-1">
				{#each BountyKinds as choice (choice)}<option value={choice}>{BountyKindCatalogue[choice].label}</option>{/each}
			</select>
		</label>
		{#if isNamed}
			<label class="text-xs text-mist-400">Which fish
				<select name="targetCarpId" class="field mt-1">
					{#each namedFish as fish (fish.id)}<option value={fish.id}>{fishWords(fish)}</option>{/each}
				</select>
			</label>
		{/if}
		<label class="text-xs text-mist-400">Prize £<input name="money" type="number" min={OwnersBounty.LeastMoney} max={OwnersBounty.MostMoney} step="50" bind:value={money} class="field mt-1 w-28" /></label>
		<label class="text-xs text-mist-400">Days<input name="days" type="number" min={BountyDraw.ShortestWindowDays} max={BountyDraw.LongestWindowDays} bind:value={days} class="field mt-1 w-20" /></label>
		<button class="button-secondary px-3 py-1 text-base" disabled={!canPost}>Post the bounty</button>
	</div>
	<p class="text-xs text-mist-400">{BountyKindCatalogue[kind].wonBy}.</p>
</form>
