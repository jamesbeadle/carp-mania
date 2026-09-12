<script lang="ts">
	import CatchReportList from '$lib/components/CatchReportList.svelte';
	import AnglerAvatar from '$lib/components/angler/AnglerAvatar.svelte';
	import AnglerWaterCard from '$lib/components/angler/AnglerWaterCard.svelte';
	import FamousFish from '$lib/components/angler/FamousFish.svelte';
	import PersonalBests from '$lib/components/angler/PersonalBests.svelte';
	import SkillBars from '$lib/components/angler/SkillBars.svelte';
	import Pager from '$lib/components/lists/Pager.svelte';
	import { placeInTheLine } from '$lib/domain/legacy/diary';
	import { listPathFor } from '$lib/domain/lists/listPath';
	import { formatWeight } from '$lib/format/weight';

	let { data } = $props();

	const angler = $derived(data.angler);
	const hrefFor = (page: number) => listPathFor(`/anglers/${angler.profile.id}`, {}, page);
	const personalBestLb = $derived(angler.personalBests.length > 0 ? Number(angler.personalBests[0].weight_lb) : 0);
</script>

<div class="mb-6 flex flex-wrap items-center gap-4">
	<AnglerAvatar avatarUrl={angler.profile.avatar_url} name={angler.profile.display_name} isLarge />
	<div>
		<p class="stat-label"><a href="/anglers" class="hover:text-mist-100">Anglers</a></p>
		<h1 class="text-4xl text-volt-300">{angler.profile.display_name}</h1>
		{#if angler.line}<p class="text-sm text-mist-400">Aged {angler.line.age} · {placeInTheLine(angler.line.generation)}</p>{/if}
	</div>
	{#if angler.isViewer}
		<p class="ml-auto text-sm text-mist-400">This is you. <a href="/angler" class="text-volt-300 hover:underline">Open my angler</a></p>
	{/if}
</div>

<div class="grid gap-6 lg:grid-cols-2">
	<section class="panel">
		<dl class="mb-6 grid grid-cols-3 gap-3 text-sm">
			<div><dt class="stat-label">Overall skill</dt><dd class="text-xl">{Math.round(angler.overallSkill)}</dd></div>
			<div><dt class="stat-label">Landed</dt><dd class="text-xl">{angler.profile.experience}</dd></div>
			<div><dt class="stat-label">Personal best</dt><dd class="text-xl">{formatWeight(personalBestLb)}</dd></div>
		</dl>
		<h2 class="mb-3 text-xl text-volt-300">Skills</h2>
		<SkillBars profile={angler.profile} />
	</section>
	<AnglerWaterCard waters={angler.waters} anglerName={angler.profile.display_name} />
	<section class="panel">
		<h2 class="mb-3 text-xl text-volt-300">Personal bests</h2>
		<PersonalBests catches={angler.personalBests} carpNames={angler.carpNames} lakeNames={angler.lakeNames} />
	</section>
	<section class="panel">
		<h2 class="mb-3 text-xl text-volt-300">Famous fish</h2>
		<FamousFish fish={angler.famousFish} />
	</section>
	<section class="panel lg:col-span-2">
		<h2 class="mb-3 text-xl text-volt-300">Catches</h2>
		<CatchReportList catches={angler.recentCatches.items} carpNames={angler.carpNames} lakeNames={angler.lakeNames} />
		<Pager page={angler.recentCatches} noun="catch" plural="catches" {hrefFor} />
	</section>
</div>
