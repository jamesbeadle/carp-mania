<script lang="ts">
	import CatchReportList from '$lib/components/CatchReportList.svelte';
	import AnglerAvatar from '$lib/components/angler/AnglerAvatar.svelte';
	import AnglerWaterCard from '$lib/components/angler/AnglerWaterCard.svelte';
	import FamousFish from '$lib/components/angler/FamousFish.svelte';
	import SkillsPanel from '$lib/components/angler/SkillsPanel.svelte';
	import Pager from '$lib/components/lists/Pager.svelte';
	import AnglerRanksLine from '$lib/components/trophy/AnglerRanksLine.svelte';
	import CatchCards from '$lib/components/trophy/CatchCards.svelte';
	import MeasureUp from '$lib/components/trophy/MeasureUp.svelte';
	import AwardsPanel from '$lib/components/angler/AwardsPanel.svelte';
	import RecordsHeld from '$lib/components/trophy/RecordsHeld.svelte';
	import { placeInTheLine } from '$lib/domain/legacy/diary';
	import { listPathFor } from '$lib/domain/lists/listPath';
	import { formatWeight } from '$lib/format/weight';

	let { data } = $props();

	const angler = $derived(data.angler);
	const room = $derived(angler.trophyRoom);
	const hrefFor = (page: number) => listPathFor(`/anglers/${angler.profile.id}`, {}, page);
	const headlineStats = $derived([
		{ label: 'Rating', value: String(Math.round(angler.rating)), tone: 'volt' as const },
		{ label: 'Landed', value: String(angler.profile.experience), caption: 'fish' },
		{ label: 'Personal best', value: formatWeight(room.ranks.bestLb) }
	]);
</script>

<svelte:head><title>{angler.profile.display_name} · Carp Mania</title></svelte:head>

<div class="mb-6 flex flex-wrap items-center gap-4">
	<AnglerAvatar avatarUrl={angler.profile.avatar_url} name={angler.profile.display_name} isLarge />
	<div>
		<p class="stat-label"><a href="/anglers" class="hover:text-mist-100">Anglers</a></p>
		<h1 class="text-4xl text-volt-300">{angler.profile.display_name}</h1>
		{#if angler.line}<p class="text-sm text-mist-400">Aged {angler.line.age} · {placeInTheLine(angler.line.generation)}</p>{/if}
		<AnglerRanksLine ranks={room.ranks} />
	</div>
	{#if angler.isViewer}
		<p class="ml-auto text-sm text-mist-400">This is you. <a href="/angler" class="text-volt-300 hover:underline">Open my angler</a></p>
	{/if}
</div>

<div class="space-y-6">
	{#if angler.measureUp}<MeasureUp measureUp={angler.measureUp} />{/if}
	<CatchCards cards={room.cards} />
	<div class="grid gap-6 lg:grid-cols-2">
		<RecordsHeld records={room.recordsHeld} />
		<AwardsPanel awards={room.awards} />
	</div>
	<div class="grid gap-6 lg:grid-cols-2">
		<SkillsPanel stats={headlineStats} profile={angler.profile} />
		<AnglerWaterCard waters={angler.waters} anglerName={angler.profile.display_name} />
		<section class="panel">
			<h2 class="mb-3 text-xl text-volt-300">Famous fish</h2>
			<FamousFish fish={angler.famousFish} />
		</section>
		<section class="panel">
			<h2 class="mb-3 text-xl text-volt-300">Catches</h2>
			<CatchReportList catches={angler.recentCatches.items} carpNames={angler.carpNames} lakeNames={angler.lakeNames} />
			<Pager page={angler.recentCatches} noun="catch" plural="catches" {hrefFor} />
		</section>
	</div>
</div>
