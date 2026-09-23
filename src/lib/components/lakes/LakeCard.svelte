<script lang="ts">
	import type { PublicLakeSummary } from '$lib/contracts/PublicLakeSummary';
	import { ClosedForRestocking, isStockedToOpen } from '$lib/domain/stock/stockedToOpen';
	import { RegionCatalogue } from '$lib/domain/world/regions';
	import { formatMoney } from '$lib/format/money';
	import { formatWeight } from '$lib/format/weight';
	import { worldUrlForLake } from '$lib/game/world/worldUrl';
	import FacilitiesRow from '../facilities/FacilitiesRow.svelte';
	import GoFishingButton from '../game/GoFishingButton.svelte';
	import FavouriteStar from './FavouriteStar.svelte';
	import SponsorLine from './SponsorLine.svelte';

	let { summary, isFavourite }: { summary: PublicLakeSummary; isFavourite: boolean } = $props();

	const isOnTheGlobe = $derived(summary.lake.latitude !== null);
	const isClosedForRestocking = $derived(!isStockedToOpen(summary.carpCount));
	const now = new Date();
	const stats = $derived([
		{ label: 'Reputation', value: String(Math.round(Number(summary.lake.reputation))) },
		{ label: 'Stock', value: String(summary.carpCount) },
		{ label: 'Biggest', value: formatWeight(summary.heaviestCarpLb) },
		{ label: 'From', value: formatMoney(summary.fromPrice), isPrice: true }
	]);
	const facts = $derived([
		`${summary.swimCount} ${summary.swimCount === 1 ? 'peg' : 'pegs'}`,
		`transparency ${Math.round(Number(summary.lake.transparency))}%`,
		summary.lake.has_bailiff ? 'bailiffed' : 'no bailiff',
		`${summary.lake.pike_count} pike`
	]);
</script>

<article class="panel flex flex-col gap-3">
	<div class="flex items-start gap-2">
		<div class="min-w-0">
			<p class="stat-label">{summary.ownerName}'s water · {RegionCatalogue[summary.lake.region].label}</p>
			<h2 class="text-2xl text-volt-300">{summary.lake.name}</h2>
		</div>
		<div class="ml-auto"><FavouriteStar lakeId={summary.lake.id} {isFavourite} /></div>
	</div>
	<dl class="flex flex-wrap gap-x-5 gap-y-2">
		{#each stats as stat (stat.label)}
			<div class="min-w-0"><dt class="stat-label">{stat.label}</dt><dd class="font-display text-2xl leading-none font-extrabold italic tabular-nums {stat.isPrice ? 'text-volt-300' : 'text-mist-100'}">{stat.value}</dd></div>
		{/each}
	</dl>
	<FacilitiesRow built={summary.lake.layout.facilities} />
	<SponsorLine lake={summary.lake} {now} />
	<p class="flex flex-wrap gap-x-2 text-sm text-mist-400">
		<span>{facts.join(' · ')}</span>
		{#if isOnTheGlobe}<a href={worldUrlForLake(summary.lake.id)} class="text-surge-400 hover:underline">See on the globe</a>{/if}
	</p>
	<div class="mt-auto flex flex-wrap justify-end gap-3">
		<a href="/lakes/{summary.lake.id}" class="button-secondary">Look around</a>
		{#if isClosedForRestocking}
			<p class="self-center text-sm text-danger-400">{ClosedForRestocking}</p>
		{:else}
			<GoFishingButton lakeId={summary.lake.id} words="Fish here" />
		{/if}
	</div>
</article>
