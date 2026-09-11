<script lang="ts">
	import { dailyRationKilograms } from '$lib/domain/carpGrowth';
	import { FeedCatalogue, FeedTypes, totalFeedKilograms } from '$lib/domain/feed';
	import type { Lake } from '$lib/domain/types';
	import { formatMoney } from '$lib/format/money';

	let { lake, carpCount }: { lake: Lake; carpCount: number } = $props();

	let feedType = $state(FeedTypes[0]);
	let kilograms = $state(20);
	const cost = $derived(kilograms * FeedCatalogue[feedType].pricePerKilogram);
	const daysOfFeedLeft = $derived(Math.floor(totalFeedKilograms(lake.feed_stock) / Math.max(0.1, dailyRationKilograms(carpCount))));
</script>

<section class="panel">
	<h3 class="mb-1 text-xl text-gold-300">Feed</h3>
	<p class="mb-4 text-sm text-mist-400">
		{carpCount} carp eat about {dailyRationKilograms(carpCount).toFixed(1)} kg a day. Stock in the lake lasts
		<span class="text-mist-100">{daysOfFeedLeft} days</span>. Protein grows fish; hemp and particles keep them keen.
	</p>
	<ul class="mb-4 grid grid-cols-2 gap-2 text-sm sm:grid-cols-3">
		{#each FeedTypes as type (type)}
			<li class="rounded-lg bg-pond-900 px-3 py-2">
				<span class="block text-mist-400">{FeedCatalogue[type].label}</span>
				<span class="text-mist-100">{Number(lake.feed_stock[type]).toFixed(1)} kg</span>
			</li>
		{/each}
	</ul>
	<form method="POST" action="?/feed" class="grid gap-2 sm:grid-cols-[1fr_auto_auto] sm:items-end">
		<label>
			<span class="stat-label">Feed type</span>
			<select name="feedType" bind:value={feedType} class="field">
				{#each FeedTypes as type (type)}
					<option value={type}>{FeedCatalogue[type].label} — {formatMoney(FeedCatalogue[type].pricePerKilogram)}/kg · protein {Math.round(FeedCatalogue[type].proteinScore * 100)}%</option>
				{/each}
			</select>
		</label>
		<label>
			<span class="stat-label">Kilograms</span>
			<input name="kilograms" type="number" min="1" max="500" bind:value={kilograms} class="field w-28" />
		</label>
		<button class="button-primary">Buy for {formatMoney(cost)}</button>
	</form>
</section>
