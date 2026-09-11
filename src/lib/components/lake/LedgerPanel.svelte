<script lang="ts">
	import type { Carp, Catch, LakeVisit } from '$lib/domain/types';
	import { formatWhen } from '$lib/format/dates';
	import { formatMoney } from '$lib/format/money';
	import CatchReportList from '../CatchReportList.svelte';

	let { visits, catches, carp }: { visits: LakeVisit[]; catches: Catch[]; carp: Carp[] } = $props();

	const carpNames = $derived(Object.fromEntries(carp.map((fish) => [fish.id, fish.name])));
</script>

<div class="grid gap-6 lg:grid-cols-2">
	<section class="panel">
		<h3 class="mb-3 text-xl text-volt-300">Catch reports</h3>
		<CatchReportList {catches} {carpNames} />
	</section>
	<section class="panel">
		<h3 class="mb-3 text-xl text-volt-300">Day tickets</h3>
		{#if visits.length === 0}
			<p class="text-sm text-mist-400">Nobody has fished here yet.</p>
		{:else}
			<ul class="divide-y divide-carbon-700/60 text-sm">
				{#each visits as visit (visit.id)}
					<li class="flex items-baseline gap-3 py-2">
						<span class="text-mist-100">{visit.angler_name}</span>
						<span class="text-mist-400">{visit.fish_caught} fish</span>
						<span class="ml-auto" class:text-volt-300={Number(visit.fee_paid) > 0} class:text-danger-400={Number(visit.fee_paid) === 0}>
							{Number(visit.fee_paid) > 0 ? formatMoney(visit.fee_paid) : 'fished free'}
						</span>
						<span class="text-xs text-mist-400">{formatWhen(visit.visited_at)}</span>
					</li>
				{/each}
			</ul>
		{/if}
	</section>
</div>
