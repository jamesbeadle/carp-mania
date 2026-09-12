<script lang="ts">
	import CatchReportList from '$lib/components/CatchReportList.svelte';
	import SkillBars from '$lib/components/angler/SkillBars.svelte';
	import FamilyLine from '$lib/components/legacy/FamilyLine.svelte';
	import TrophyCabinet from '$lib/components/legacy/TrophyCabinet.svelte';
	import Pager from '$lib/components/lists/Pager.svelte';
	import { placeInTheLine } from '$lib/domain/legacy/diary';
	import { listPathFor } from '$lib/domain/lists/listPath';
	import { formatMoney } from '$lib/format/money';
	import { formatWeight } from '$lib/format/weight';

	let { data } = $props();

	const MyAnglerPath = '/angler';
	const hrefFor = (page: number) => listPathFor(MyAnglerPath, {}, page);
</script>

<div class="mb-6 flex flex-wrap items-end gap-4">
	<div>
		<h1 class="text-4xl text-volt-300">{data.angler.profile.display_name}</h1>
		<p class="text-sm text-mist-400">Aged {data.angler.diary.age} · {placeInTheLine(data.angler.diary.current.generation)}{#if data.angler.diary.isSlowingDown} · slowing down now{/if}</p>
	</div>
	<a href="/anglers/{data.angler.profile.id}" class="button-secondary ml-auto">My public page</a>
	<a href="/anglers" class="text-sm text-mist-400 hover:text-mist-100">All anglers</a>
</div>

<div class="grid gap-6 lg:grid-cols-[2fr_3fr]">
	<section class="panel">
		<dl class="mb-6 grid grid-cols-3 gap-3 text-sm">
			<div><dt class="stat-label">Money</dt><dd class="text-xl">{formatMoney(data.angler.profile.money)}</dd></div>
			<div><dt class="stat-label">Landed</dt><dd class="text-xl">{data.angler.catches.total}</dd></div>
			<div><dt class="stat-label">Personal best</dt><dd class="text-xl">{formatWeight(data.angler.personalBestLb)}</dd></div>
		</dl>
		<h2 class="mb-3 text-xl text-volt-300">Skills</h2>
		<SkillBars profile={data.angler.profile} />
		<p class="mt-4 text-xs text-mist-400">Skills rise with every fish, and faster when the tackle suited the water. Match readouts unlock at 40.</p>
	</section>
	<section class="panel">
		<h2 class="mb-3 text-xl text-volt-300">Catch history</h2>
		<CatchReportList catches={data.angler.catches.items} carpNames={data.angler.carpNames} lakeNames={data.angler.lakeNames} />
		<Pager page={data.angler.catches} noun="catch" plural="catches" {hrefFor} />
		<a href="/angler/scrapbook/{data.angler.diary.current.id}" class="mt-3 inline-block text-sm text-surge-400 hover:underline">The scrapbook so far →</a>
	</section>
	<div class="lg:col-span-2"><TrophyCabinet trophies={data.angler.trophies} /></div>
	<div class="lg:col-span-2"><FamilyLine line={data.angler.diary.line} currentId={data.angler.diary.current.id} /></div>
</div>
<form method="POST" action="/auth/signout" class="mt-8 text-center lg:hidden">
	<button class="text-sm text-mist-400 hover:text-mist-100">Sign out</button>
</form>
