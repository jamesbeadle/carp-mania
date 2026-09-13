<script lang="ts">
	import type { RecentCatches } from '$lib/contracts/RecentCatches';
	import { formatWeight } from '$lib/format/weight';
	import CatchReportList from '../CatchReportList.svelte';

	let { catches, carpNames }: { catches: RecentCatches; carpNames: Record<string, string> } = $props();

	const visitors = $derived(catches.visitorsThisWeek);
	const visitorsWords = $derived(
		visitors.count === 0 ? 'No visitors have caught here this week.' : `${visitors.count} fish to visitors this week, best ${formatWeight(visitors.bestLb)}.`
	);
</script>

<section class="panel">
	<h2 class="mb-1 text-xl text-volt-300">Anglers' catches</h2>
	<p class="mb-3 text-xs text-mist-400">What other players have had here. Beat it.</p>
	{#if catches.byAnglers.length === 0}
		<p class="text-sm text-mist-400">No angler has landed a fish here yet — the first name on this list could be yours.</p>
	{:else}
		<CatchReportList catches={catches.byAnglers} {carpNames} />
	{/if}
	<details class="mt-4 text-sm">
		<summary class="cursor-pointer text-mist-400 hover:text-mist-200">Visitors · {visitorsWords}</summary>
		<div class="mt-2 opacity-70">
			<CatchReportList catches={catches.byVisitors} {carpNames} />
		</div>
	</details>
</section>
