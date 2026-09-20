<script lang="ts">
	import CatchReportList from '$lib/components/CatchReportList.svelte';
	import RatingDial from '$lib/components/angler/RatingDial.svelte';
	import Diary from '$lib/components/angler/Diary.svelte';
	import RivalCard from '$lib/components/angler/RivalCard.svelte';
	import SkillBars from '$lib/components/angler/SkillBars.svelte';
	import FamilyLine from '$lib/components/legacy/FamilyLine.svelte';
	import TrophyCabinet from '$lib/components/legacy/TrophyCabinet.svelte';
	import Pager from '$lib/components/lists/Pager.svelte';
	import Skeleton from '$lib/components/loading/Skeleton.svelte';
	import AnglerRanksLine from '$lib/components/trophy/AnglerRanksLine.svelte';
	import CatchCards from '$lib/components/trophy/CatchCards.svelte';
	import Milestones from '$lib/components/trophy/Milestones.svelte';
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
</script>

<svelte:head><title>My angler · Carp Mania</title></svelte:head>

<div class="mb-6 flex flex-wrap items-end gap-4">
	<div>
		<h1 class="text-4xl text-volt-300">{angler.profile.display_name}</h1>
		<p class="text-sm text-mist-400">Aged {diary.age} · {placeInTheLine(current.generation)}{#if diary.isSlowingDown} · slowing down now{/if}</p>
		<AnglerRanksLine ranks={room.ranks} />
	</div>
	<a href="/anglers/{angler.profile.id}" class="button-secondary ml-auto">My public page</a>
	<a href="/anglers" class="text-sm text-mist-400 hover:text-mist-100">All anglers</a>
</div>

<div class="space-y-6">
	<RatingDial rating={angler.rating} skills={angler.profile} />
	<CatchCards cards={room.cards} isMine />
	<div class="grid gap-6 lg:grid-cols-2">
		<RecordsHeld records={room.recordsHeld} isMine />
		<Milestones milestones={room.milestones} />
	</div>
	<div class="grid gap-6 lg:grid-cols-[2fr_3fr]">
		<div class="space-y-6">
			{#await data.rival}
				<Skeleton title="The one to beat" rows={2} />
			{:then rival}
				<RivalCard {rival} />
			{:catch}
				<p class="text-sm text-mist-400">The world board would not load.</p>
			{/await}
			<section class="panel">
				<dl class="mb-6 grid grid-cols-3 gap-3 text-sm">
					<div><dt class="stat-label">Money</dt><dd class="text-xl">{formatMoney(angler.profile.money)}</dd></div>
					<div><dt class="stat-label">Landed</dt><dd class="text-xl">{angler.catches.total}</dd></div>
					<div><dt class="stat-label">Personal best</dt><dd class="text-xl">{formatWeight(angler.personalBestLb)}</dd></div>
				</dl>
				<h2 class="mb-3 text-xl text-volt-300">Skills</h2>
				<SkillBars profile={angler.profile} />
				<p class="mt-4 text-xs text-mist-400">Line selection is how invisible your line is; rig selection how well the rig suits the spot; bait selection what the fish trust; watercraft finding the fish and reading the bite. Skills rise with every fish, and faster when the tackle suited the water. Match readouts unlock at craft 40.</p>
			</section>
		</div>
		<section class="panel">
			<h2 class="mb-3 text-xl text-volt-300">Catch history</h2>
			<CatchReportList catches={catches.items} carpNames={angler.carpNames} lakeNames={angler.lakeNames} />
			<Pager page={catches} noun="catch" plural="catches" {hrefFor} />
			<a href="/angler/scrapbook/{current.id}" class="mt-3 inline-block text-sm text-surge-400 hover:underline">The scrapbook so far →</a>
		</section>
		<div class="lg:col-span-2"><TrophyCabinet trophies={angler.trophies} /></div>
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
