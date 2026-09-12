<script lang="ts">
	import type { AnglerDirectoryEntry } from '$lib/contracts/AnglerDirectory';
	import { formatWeight } from '$lib/format/weight';
	import AnglerAvatar from './AnglerAvatar.svelte';
	import SkillBars from './SkillBars.svelte';

	let { angler, rank }: { angler: AnglerDirectoryEntry; rank: number } = $props();
</script>

<article class="panel flex flex-col gap-4">
	<div class="flex items-center gap-3">
		<AnglerAvatar avatarUrl={angler.avatarUrl} name={angler.displayName} />
		<div class="min-w-0">
			<p class="stat-label">No. {rank}</p>
			<h2 class="truncate text-2xl text-volt-300"><a href="/anglers/{angler.id}" class="hover:underline">{angler.displayName}</a></h2>
		</div>
		<div class="ml-auto text-right">
			<p class="stat-label">Skill</p>
			<p class="font-display text-3xl font-bold text-volt-300 italic">{Math.round(angler.overallSkill)}</p>
		</div>
	</div>
	<SkillBars profile={angler.skills} isCompact />
	<dl class="grid grid-cols-2 gap-2 text-sm">
		<div><dt class="stat-label">Personal best</dt><dd class="text-xl">{formatWeight(angler.personalBestLb)}</dd></div>
		<div><dt class="stat-label">Landed</dt><dd class="text-xl">{angler.totalCatches}</dd></div>
	</dl>
	<p class="mt-auto text-sm text-mist-400">
		{#if angler.water}
			Runs <a href="/lakes/{angler.water.id}" class="text-mist-100 hover:underline">{angler.water.name}</a>
		{:else}
			No water open to anglers
		{/if}
	</p>
</article>
