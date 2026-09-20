<script lang="ts">
	import type { RecentCatches } from '$lib/contracts/RecentCatches';
	import { formatWeight } from '$lib/format/weight';
	import CatchReportList from '../CatchReportList.svelte';
	import StatRow from '../stats/StatRow.svelte';

	let { catches, carpNames }: { catches: RecentCatches; carpNames: Record<string, string> } = $props();

	const NothingYet = '—';
	const visitors = $derived(catches.visitorsThisWeek);
	const anglersBestLb = $derived(catches.byAnglers.reduce((best, report) => Math.max(best, Number(report.weight_lb)), 0));
	const stats = $derived([
		{ label: 'By anglers', value: String(catches.byAnglers.length), caption: 'recent', tone: 'volt' as const },
		{ label: 'Their best', value: anglersBestLb > 0 ? formatWeight(anglersBestLb) : NothingYet },
		{ label: 'To visitors', value: String(visitors.count), caption: 'this week' },
		{ label: 'Visitors\' best', value: visitors.count > 0 ? formatWeight(visitors.bestLb) : NothingYet }
	]);
</script>

<section class="panel">
	<h2 class="mb-3 text-xl text-volt-300">Anglers' catches</h2>
	<div class="mb-4"><StatRow {stats} /></div>
	{#if catches.byAnglers.length === 0}
		<p class="text-sm text-mist-400">No angler has landed a fish here yet — the first name on this list could be yours.</p>
	{:else}
		<CatchReportList catches={catches.byAnglers} {carpNames} />
	{/if}
	<details class="mt-4 text-sm">
		<summary class="cursor-pointer text-mist-400 hover:text-mist-200">The visitors' catches</summary>
		<div class="mt-2 opacity-70">
			<CatchReportList catches={catches.byVisitors} {carpNames} />
		</div>
	</details>
</section>
