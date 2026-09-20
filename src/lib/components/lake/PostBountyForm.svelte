<script lang="ts">
	import { BountyDraw, NamedFishFromLb, OwnersBounty } from '$lib/domain/bounties/bountyDraw';
	import { BountyKindCatalogue, BountyKinds, type BountyKind } from '$lib/domain/bounties/bountyKinds';
	import type { Carp } from '$lib/domain/types';
	import { formatMoney } from '$lib/format/money';
	import { formatWeight } from '$lib/format/weight';
	import StatRow from '../stats/StatRow.svelte';

	let { carp }: { carp: Carp[] } = $props();

	let kind = $state<BountyKind>('top_of_the_water');
	let money = $state(OwnersBounty.LeastMoney);
	let days = $state(BountyDraw.ShortestWindowDays);
	const namedFish = $derived(carp.filter((fish) => fish.is_catalogued && Number(fish.weight_lb) >= NamedFishFromLb));
	const isNamed = $derived(kind === 'named_fish');
	const canPost = $derived(!isNamed || namedFish.length > 0);
	const fishWords = (fish: Carp) => `${fish.name} · ${formatWeight(fish.weight_lb)}`;
	const stats = $derived([
		{ label: 'Prize from', value: formatMoney(OwnersBounty.LeastMoney), caption: `to ${formatMoney(OwnersBounty.MostMoney)}`, tone: 'volt' as const },
		{ label: 'Runs for', value: `${BountyDraw.ShortestWindowDays}–${BountyDraw.LongestWindowDays}`, caption: 'days' },
		{ label: 'Named fish from', value: formatWeight(NamedFishFromLb) },
		{ label: 'Fish that qualify', value: String(namedFish.length) }
	]);
</script>

<form method="POST" action="?/postBounty" class="space-y-4">
	<StatRow {stats} />
	<div class="flex flex-wrap items-end gap-3">
		<label class="flex flex-col gap-1 text-xs text-mist-400">
			<span>What wins it</span>
			<select name="kind" bind:value={kind} class="field">
				{#each BountyKinds as choice (choice)}<option value={choice}>{BountyKindCatalogue[choice].label}</option>{/each}
			</select>
		</label>
		{#if isNamed}
			<label class="flex flex-col gap-1 text-xs text-mist-400">
				<span>Which fish</span>
				<select name="targetCarpId" class="field">
					{#each namedFish as fish (fish.id)}<option value={fish.id}>{fishWords(fish)}</option>{/each}
				</select>
			</label>
		{/if}
		<label class="flex flex-col gap-1 text-xs text-mist-400">
			<span>Prize (£)</span>
			<input name="money" type="number" min={OwnersBounty.LeastMoney} max={OwnersBounty.MostMoney} step="50" bind:value={money} class="field w-28" />
		</label>
		<label class="flex flex-col gap-1 text-xs text-mist-400">
			<span>Days</span>
			<input name="days" type="number" min={BountyDraw.ShortestWindowDays} max={BountyDraw.LongestWindowDays} bind:value={days} class="field w-20" />
		</label>
		<button class="button-secondary px-3 py-1 text-base" disabled={!canPost}>Post the bounty</button>
	</div>
	<p class="text-xs text-mist-400">Won by {BountyKindCatalogue[kind].wonBy}. Your own money on the water is the cheapest way to fill a quiet week.</p>
</form>
