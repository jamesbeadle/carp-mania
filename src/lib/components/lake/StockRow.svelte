<script lang="ts">
	import { guidePriceOf } from '$lib/domain/market/valuation';
	import { StrainCatalogue } from '$lib/domain/strains';
	import type { Carp } from '$lib/domain/types';
	import { conditionTone } from '$lib/format/conditionTone';
	import { formatMoney } from '$lib/format/money';
	import { formatWeight } from '$lib/format/weight';
	import TransitBadge from '../carp/TransitBadge.svelte';

	interface Props {
		fish: Carp;
		isChosen: boolean;
		onToggle: (fish: Carp) => void;
	}

	let { fish, isChosen, onToggle }: Props = $props();
</script>

<tr class="border-t border-carbon-700/60" class:bg-carbon-800={isChosen}>
	<td class="py-2 pr-3"><input type="checkbox" checked={isChosen} onchange={() => onToggle(fish)} aria-label="Choose {fish.name}" /></td>
	<td class="py-2 pr-3 font-medium text-mist-100">
		<a href="/carp/{fish.id}" class="hover:underline">{fish.name}</a>
		<TransitBadge carp={fish} />
	</td>
	<td class="py-2 pr-3">{StrainCatalogue[fish.strain].label}</td>
	<td class="py-2 pr-3 text-volt-300">{formatWeight(fish.weight_lb)}</td>
	<td class="py-2 pr-3">{fish.age_years} yrs</td>
	<td class="py-2 pr-3 {conditionTone(Number(fish.condition))}">{Math.round(Number(fish.condition))}%</td>
	<td class="py-2 pr-3">{formatMoney(guidePriceOf(fish))}</td>
	<td class="py-2">{fish.times_caught}×</td>
</tr>
