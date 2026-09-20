<script lang="ts">
	import type { AnglerDirectoryEntry } from '$lib/contracts/AnglerDirectory';
	import { formatWeight } from '$lib/format/weight';
	import AnglerAvatar from './AnglerAvatar.svelte';
	import StatRow from '../stats/StatRow.svelte';
	import SkillBars from './SkillBars.svelte';

	let { angler, rank }: { angler: AnglerDirectoryEntry; rank: number } = $props();

	const stats = $derived([
		{ label: 'Personal best', value: formatWeight(angler.personalBestLb) },
		{ label: 'Landed', value: String(angler.totalCatches), caption: 'fish' }
	]);
</script>

<article class="panel flex flex-col gap-4">
	<div class="flex items-center gap-3">
		<AnglerAvatar avatarUrl={angler.avatarUrl} name={angler.displayName} />
		<div class="min-w-0">
			<p class="stat-label">No. {rank}</p>
			<h2 class="truncate text-2xl text-volt-300"><a href="/anglers/{angler.id}" class="hover:underline">{angler.displayName}</a></h2>
		</div>
		<div class="ml-auto text-right">
			<p class="stat-label">Rating</p>
			<p class="font-display text-3xl font-bold text-volt-300 italic">{Math.round(angler.rating)}</p>
		</div>
	</div>
	<SkillBars profile={angler.skills} isCompact />
	<StatRow {stats} />
	<p class="mt-auto text-sm text-mist-400">
		{#if angler.water}
			Runs <a href="/lakes/{angler.water.id}" class="text-mist-100 hover:underline">{angler.water.name}</a>
		{:else}
			No water open to anglers
		{/if}
	</p>
</article>
