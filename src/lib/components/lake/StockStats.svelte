<script lang="ts">
	import { guidePriceOf } from '$lib/domain/market/valuation';
	import { headCountOf, representativeOf, type Shoal } from '$lib/domain/stock/shoals';
	import type { Carp } from '$lib/domain/types';
	import { formatMoney } from '$lib/format/money';
	import { formatWeight } from '$lib/format/weight';
	import StatRow from '../stats/StatRow.svelte';

	let { carp, shoals }: { carp: Carp[]; shoals: Shoal[] } = $props();

	const NoFish = '—';
	const biggest = $derived(carp.reduce<Carp | null>(heavierOf, null));
	const namedValue = $derived(carp.reduce((total, fish) => total + guidePriceOf(fish), 0));
	const shoalValue = $derived(shoals.reduce((total, shoal) => total + guidePriceOf(representativeOf(shoal)) * shoal.count, 0));
	const shoalWords = $derived(`in ${shoals.length} ${shoals.length === 1 ? 'shoal' : 'shoals'}`);
	const stats = $derived([
		{ label: 'Named carp', value: String(carp.length), tone: 'volt' as const },
		{ label: 'Shoal fish', value: String(headCountOf(shoals)), caption: shoalWords },
		{ label: 'Biggest', value: biggest ? formatWeight(biggest.weight_lb) : NoFish, caption: biggest?.name ?? 'no named fish yet' },
		{ label: 'Guide value', value: formatMoney(namedValue + shoalValue), caption: 'whole stock' }
	]);

	function heavierOf(heaviest: Carp | null, fish: Carp) {
		if (heaviest === null) return fish;
		return Number(fish.weight_lb) > Number(heaviest.weight_lb) ? fish : heaviest;
	}
</script>

<StatRow {stats} />
