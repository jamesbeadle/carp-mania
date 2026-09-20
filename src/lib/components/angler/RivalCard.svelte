<script lang="ts">
	import type { MyRival } from '$lib/contracts/Rivalry';
	import { NobodyAbove, placeLine, toBeatLine } from '$lib/domain/world/rivalWords';
	import { formatWeight } from '$lib/format/weight';
	import StatRow from '../stats/StatRow.svelte';
	import AnglerAvatar from './AnglerAvatar.svelte';

	let { rival }: { rival: MyRival } = $props();

	const isOnTheLadder = $derived(rival.standing.bestLb > 0);
	const stats = $derived([
		{ label: 'Your place', value: `No. ${rival.standing.rank}`, caption: `of ${rival.standing.anglers}`, tone: 'volt' as const },
		{ label: 'Your best', value: formatWeight(rival.standing.bestLb) },
		...chaserStat(rival)
	]);

	function chaserStat(rivalry: MyRival) {
		if (rivalry.below === null) return [];
		const gapLb = rivalry.standing.bestLb - rivalry.below.bestLb;
		return [{ label: 'Chasing you', value: formatWeight(gapLb), caption: `behind · ${rivalry.below.displayName}` }];
	}
</script>

<section class="panel">
	<p class="stat-label">The one to beat</p>
	{#if rival.above}
		<a href="/anglers/{rival.above.anglerId}" class="mt-1 flex items-center gap-3">
			<AnglerAvatar avatarUrl={rival.above.avatarUrl} name={rival.above.displayName} />
			<span class="min-w-0">
				<span class="block truncate text-2xl text-volt-300 hover:underline">{rival.above.displayName}</span>
				<span class="block text-sm text-mist-400">{placeLine(rival.above)}</span>
			</span>
		</a>
	{:else}
		<h2 class="mt-1 text-2xl text-volt-300">{NobodyAbove}</h2>
	{/if}
	<p class="mt-3 text-sm leading-snug text-mist-100">{toBeatLine(rival)}</p>
	{#if isOnTheLadder}<div class="mt-3"><StatRow {stats} /></div>{/if}
	<a href="/world/hall-of-fame" class="mt-3 inline-block text-sm text-surge-400 hover:underline">The world board →</a>
</section>
