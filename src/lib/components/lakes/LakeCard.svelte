<script lang="ts">
	import type { PublicLakeSummary } from '$lib/contracts/PublicLakeSummary';
	import { RegionCatalogue } from '$lib/domain/world/regions';
	import { formatMoney } from '$lib/format/money';
	import { formatWeight } from '$lib/format/weight';
	import { worldUrlForLake } from '$lib/game/world/worldUrl';
	import GoFishingButton from '../game/GoFishingButton.svelte';
	import FavouriteStar from './FavouriteStar.svelte';

	let { summary, isFavourite }: { summary: PublicLakeSummary; isFavourite: boolean } = $props();

	const isOnTheGlobe = $derived(summary.lake.latitude !== null);
</script>

<article class="panel flex flex-col gap-3">
	<div class="flex items-start gap-2">
		<div class="min-w-0">
			<p class="stat-label">{summary.ownerName}'s water · {RegionCatalogue[summary.lake.region].label}</p>
			<h2 class="text-2xl text-volt-300">{summary.lake.name}</h2>
		</div>
		<div class="ml-auto"><FavouriteStar lakeId={summary.lake.id} {isFavourite} /></div>
	</div>
	<dl class="grid grid-cols-3 gap-2 text-sm">
		<div><dt class="stat-label">Reputation</dt><dd class="text-xl">{Math.round(Number(summary.lake.reputation))}</dd></div>
		<div><dt class="stat-label">Stock</dt><dd class="text-xl">{summary.carpCount}</dd></div>
		<div><dt class="stat-label">Biggest</dt><dd class="text-xl">{formatWeight(summary.heaviestCarpLb)}</dd></div>
	</dl>
	<p class="text-sm text-mist-400">
		{summary.swimCount} {summary.swimCount === 1 ? 'peg' : 'pegs'} · transparency {Math.round(Number(summary.lake.transparency))}% · {summary.lake.has_bailiff ? 'bailiffed' : 'no bailiff'} · {summary.lake.pike_count} pike
		{#if isOnTheGlobe}· <a href={worldUrlForLake(summary.lake.id)} class="text-surge-400 hover:underline">See on the globe</a>{/if}
	</p>
	<div class="mt-auto flex items-center gap-3">
		<span class="text-lg text-volt-300"><span class="text-xs text-mist-400">from </span>{formatMoney(summary.fromPrice)}</span>
		<a href="/lakes/{summary.lake.id}" class="button-secondary ml-auto">Look around</a>
		<GoFishingButton lakeId={summary.lake.id} words="Fish here" />
	</div>
</article>
