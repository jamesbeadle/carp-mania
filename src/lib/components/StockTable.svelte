<script lang="ts">
	import type { Carp } from '$lib/domain/types';
	import { StrainCatalogue } from '$lib/domain/strains';
	import { formatWeight } from '$lib/format/weight';

	let { carp, limit = 25 }: { carp: Carp[]; limit?: number } = $props();

	let isShowingAll = $state(false);
	const visibleCarp = $derived(isShowingAll ? carp : carp.slice(0, limit));
	const conditionTone = (condition: number) => (condition < 35 ? 'text-danger-400' : condition < 60 ? 'text-surge-300' : 'text-volt-300');
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
				<th class="py-2 font-medium">Caught</th>
			</tr>
		</thead>
		<tbody>
			{#each visibleCarp as fish (fish.id)}
				<tr class="border-t border-carbon-700/60">
					<td class="py-2 pr-3 font-medium text-mist-100">{fish.name}</td>
					<td class="py-2 pr-3">{StrainCatalogue[fish.strain].label}</td>
					<td class="py-2 pr-3 text-volt-300">{formatWeight(fish.weight_lb)}</td>
					<td class="py-2 pr-3">{fish.age_years} yrs</td>
					<td class="py-2 pr-3 {conditionTone(Number(fish.condition))}">{Math.round(Number(fish.condition))}%</td>
					<td class="py-2">{fish.times_caught}×</td>
				</tr>
			{/each}
		</tbody>
	</table>
</div>
{#if carp.length > limit}
	<button class="mt-3 text-sm text-volt-300 hover:underline" onclick={() => (isShowingAll = !isShowingAll)}>
		{isShowingAll ? 'Show fewer' : `Show all ${carp.length} fish`}
	</button>
{/if}
