<script lang="ts">
	import { dailyRationKilograms } from '$lib/domain/carpGrowth';
	import { FeedCatalogue, FeedTypes, totalFeedKilograms } from '$lib/domain/feed';
	import type { Lake } from '$lib/domain/types';
	import { formatMoney } from '$lib/format/money';
	import StatRow from '../stats/StatRow.svelte';

	let { lake, carpCount }: { lake: Lake; carpCount: number } = $props();

	const LeastRationKilograms = 0.1;
	let feedType = $state(FeedTypes[0]);
	let kilograms = $state(20);
	const cost = $derived(kilograms * FeedCatalogue[feedType].pricePerKilogram);
	const inStock = $derived(totalFeedKilograms(lake.feed_stock));
	const eatenADay = $derived(dailyRationKilograms(carpCount));
	const daysOfFeedLeft = $derived(Math.floor(inStock / Math.max(LeastRationKilograms, eatenADay)));
	const stats = $derived([
		{ label: 'Feed in stock', value: `${Math.round(inStock)} kg`, tone: 'volt' as const },
		{ label: 'Days of feed', value: String(daysOfFeedLeft), caption: 'at this rate' },
		{ label: 'Eaten a day', value: `${eatenADay.toFixed(1)} kg` },
		{ label: 'Carp to feed', value: String(carpCount) }
	]);
</script>

<section class="panel">
	<h3 class="mb-3 text-xl text-volt-300">Feed</h3>
	<StatRow {stats} />
	<ul class="my-4 grid grid-cols-2 gap-2 text-sm sm:grid-cols-3">
		{#each FeedTypes as type (type)}
			<li class="flex min-w-0 flex-wrap items-baseline gap-x-2 rounded-lg bg-carbon-900 px-3 py-2">
				<span class="text-mist-400">{FeedCatalogue[type].label}</span>
				<span class="text-mist-100 tabular-nums">{Number(lake.feed_stock[type]).toFixed(1)} kg</span>
			</li>
		{/each}
	</ul>
	<form method="POST" action="?/feed" class="grid gap-2 sm:grid-cols-[1fr_auto_auto] sm:items-end">
		<label class="flex min-w-0 flex-col gap-1">
			<span class="stat-label">Feed type</span>
			<select name="feedType" bind:value={feedType} class="field">
				{#each FeedTypes as type (type)}
					<option value={type}>{FeedCatalogue[type].label} — {formatMoney(FeedCatalogue[type].pricePerKilogram)}/kg · protein {Math.round(FeedCatalogue[type].proteinScore * 100)}%</option>
				{/each}
			</select>
		</label>
		<label class="flex flex-col gap-1">
			<span class="stat-label">Kilograms</span>
			<input name="kilograms" type="number" min="1" max="500" bind:value={kilograms} class="field w-28" />
		</label>
		<button class="button-primary">Buy for {formatMoney(cost)}</button>
	</form>
</section>
