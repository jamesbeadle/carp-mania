<script lang="ts">
	import { guidePriceOf } from '$lib/domain/market/valuation';
	import { StrainCatalogue } from '$lib/domain/strains';
	import type { Carp } from '$lib/domain/types';
	import { conditionTone } from '$lib/format/conditionTone';
	import { formatMoney } from '$lib/format/money';
	import { formatWeight } from '$lib/format/weight';
	import TransitBadge from './carp/TransitBadge.svelte';

	let { carp, limit = 25 }: { carp: Carp[]; limit?: number } = $props();

	let isShowingAll = $state(false);
	const cataloguedCarp = $derived(carp.filter((fish) => fish.is_catalogued));
	const visibleCarp = $derived(isShowingAll ? cataloguedCarp : cataloguedCarp.slice(0, limit));
</script>

<div class="overflow-x-auto">
	<table class="w-full text-sm">
		<thead class="text-left text-mist-400">
			<tr>
				<th class="py-2 pr-3 font-medium">Name</th>
				<th class="py-2 pr-3 font-medium">Strain</th>
				<th class="py-2 pr-3 font-medium">Weight</th>
				<th class="py-2 pr-3 font-medium">Age</th>
				<th class="py-2 pr-3 font-medium">Condition</th>
				<th class="py-2 pr-3 font-medium">Fame</th>
				<th class="py-2 pr-3 font-medium whitespace-nowrap">Guide price</th>
				<th class="py-2 font-medium">Caught</th>
			</tr>
		</thead>
		<tbody>
			{#each visibleCarp as fish (fish.id)}
				<tr class="border-t border-carbon-700/60">
					<td class="py-2 pr-3 font-medium text-mist-100">
						<a href="/carp/{fish.id}" class="hover:underline">{fish.name}</a>
						<TransitBadge carp={fish} />
					</td>
					<td class="py-2 pr-3">{StrainCatalogue[fish.strain].label}</td>
					<td class="py-2 pr-3 whitespace-nowrap text-volt-300">{formatWeight(fish.weight_lb)}</td>
					<td class="py-2 pr-3 whitespace-nowrap">{fish.age_years} yrs</td>
					<td class="py-2 pr-3 {conditionTone(Number(fish.condition))}">{Math.round(Number(fish.condition))}%</td>
					<td class="py-2 pr-3">{fish.fame}</td>
					<td class="py-2 pr-3 whitespace-nowrap">{formatMoney(guidePriceOf(fish))}</td>
					<td class="py-2">{fish.times_caught}×</td>
				</tr>
			{/each}
		</tbody>
	</table>
</div>
{#if cataloguedCarp.length > limit}
	<button class="mt-3 text-sm text-volt-300 hover:underline" onclick={() => (isShowingAll = !isShowingAll)}>
		{isShowingAll ? 'Show fewer' : `Show all ${cataloguedCarp.length} fish`}
	</button>
{/if}
