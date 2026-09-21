<script lang="ts">
	import CatchReportList from '$lib/components/CatchReportList.svelte';
	import RatingDial from '$lib/components/angler/RatingDial.svelte';
	import Diary from '$lib/components/angler/Diary.svelte';
	import RivalCard from '$lib/components/angler/RivalCard.svelte';
	import SkillsPanel from '$lib/components/angler/SkillsPanel.svelte';
	import FamilyLine from '$lib/components/legacy/FamilyLine.svelte';
	import Pager from '$lib/components/lists/Pager.svelte';
	import Skeleton from '$lib/components/loading/Skeleton.svelte';
	import AnglerRanksLine from '$lib/components/trophy/AnglerRanksLine.svelte';
	import CatchCards from '$lib/components/trophy/CatchCards.svelte';
	import AwardsPanel from '$lib/components/angler/AwardsPanel.svelte';
	import RecordsHeld from '$lib/components/trophy/RecordsHeld.svelte';
	import { placeInTheLine } from '$lib/domain/legacy/diary';
	import { listPathFor } from '$lib/domain/lists/listPath';
	import { LegalPages } from '$lib/legal/legalPages';
	import { formatMoney } from '$lib/format/money';
	import { formatWeight } from '$lib/format/weight';

	let { data } = $props();

	const MyAnglerPath = '/angler';
	const angler = $derived(data.angler);
	const room = $derived(angler.trophyRoom);
	const diary = $derived(angler.diary);
	const current = $derived(diary.current);
	const catches = $derived(angler.catches);
	const hrefFor = (page: number) => listPathFor(MyAnglerPath, {}, page);
	const purseStats = $derived([
		{ label: 'Money', value: formatMoney(angler.profile.money), tone: 'volt' as const },
		{ label: 'Landed', value: String(catches.total), caption: 'fish' },
		{ label: 'Personal best', value: formatWeight(angler.personalBestLb) }
	]);
</script>

<svelte:head><title>My angler · Carp Mania</title></svelte:head>

<div class="mb-6 flex flex-wrap items-end gap-4">
	<div>
		<h1 class="text-4xl text-volt-300">{angler.profile.display_name}</h1>
		<p class="text-sm text-mist-400">Aged {diary.age} · {placeInTheLine(current.generation)}{#if diary.isSlowingDown} · slowing down now{/if}</p>
		<AnglerRanksLine ranks={room.ranks} />
	</div>
	<div class="flex items-center gap-4 sm:ml-auto">
		<a href="/anglers/{angler.profile.id}" class="button-secondary whitespace-nowrap">My public page</a>
		<a href="/anglers" class="text-sm text-mist-400 hover:text-mist-100">All anglers</a>
	</div>
</div>

<div class="space-y-6">
	<RatingDial rating={angler.rating} skills={angler.profile} />
	<CatchCards cards={room.cards} isMine />
	<div class="grid gap-6 lg:grid-cols-2">
		<RecordsHeld records={room.recordsHeld} isMine />
		<AwardsPanel awards={room.awards} isMine />
	</div>
	<div class="grid gap-6 lg:grid-cols-[2fr_3fr]">
		<div class="min-w-0 space-y-6">
			{#await data.rival}
				<Skeleton title="The one to beat" rows={2} />
			{:then rival}
				<RivalCard {rival} />
			{:catch}
				<p class="text-sm text-mist-400">The world board would not load.</p>
			{/await}
			<SkillsPanel stats={purseStats} profile={angler.profile} isMine />
		</div>
		<section class="panel">
			<h2 class="mb-3 text-xl text-volt-300">Catch history</h2>
			<CatchReportList catches={catches.items} carpNames={angler.carpNames} lakeNames={angler.lakeNames} />
			<Pager page={catches} noun="catch" plural="catches" {hrefFor} />
			<a href="/angler/scrapbook/{current.id}" class="mt-3 inline-block text-sm text-surge-400 hover:underline">The scrapbook so far →</a>
		</section>
		<div class="lg:col-span-2"><Diary entries={data.diary} /></div>
		<div class="lg:col-span-2"><FamilyLine line={diary.line} currentId={current.id} /></div>
	</div>
</div>
<div class="mt-8 flex flex-wrap items-center justify-center gap-4 text-sm text-mist-400">
	{#each LegalPages as page (page.path)}<a href={page.path} class="hover:text-mist-100">{page.label}</a>{/each}
	<form method="POST" action="/auth/signout" class="lg:hidden">
		<button class="text-sm text-mist-400 hover:text-mist-100">Sign out</button>
	</form>
</div>
