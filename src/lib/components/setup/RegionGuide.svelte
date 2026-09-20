<script lang="ts">
	import type { RegionGuide } from '$lib/contracts/RegionGuide';
	import { formatMoney } from '$lib/format/money';
	import { formatWeight } from '$lib/format/weight';
	import StatRow from '../stats/StatRow.svelte';

	let { guide }: { guide: RegionGuide } = $props();

	const NoWatersYet = '—';
	const times = (factor: number) => `×${Number(factor.toFixed(2))}`;
	const hasWaters = $derived(guide.lakeCount > 0);
	const climateStats = $derived([
		{ label: 'Land', value: formatMoney(guide.landPricePerAcre), caption: 'an acre', tone: 'volt' as const },
		{ label: 'Growth ceiling', value: formatWeight(guide.growthCeilingLb) },
		{ label: 'Summer / winter', value: `${times(guide.summerGrowthFactor)} / ${times(guide.winterGrowthFactor)}`, caption: 'growth' },
		{ label: 'Anglers about', value: times(guide.anglerPoolFactor), caption: `paying ${times(guide.willingnessToPayFactor)}` }
	]);
	const neighbourStats = $derived([
		{ label: 'Waters open', value: String(guide.lakeCount) },
		{ label: 'Biggest carp', value: guide.biggestCarpLb > 0 ? formatWeight(guide.biggestCarpLb) : NoWatersYet },
		{ label: 'Day ticket', value: hasWaters ? formatMoney(guide.averageDayTicket) : NoWatersYet, caption: hasWaters ? 'on average' : '' }
	]);
</script>

<aside class="panel">
	<p class="stat-label">Region guide</p>
	<h2 class="mb-1 text-2xl text-volt-300">{guide.label}</h2>
	<p class="mb-4 text-sm text-mist-200">{guide.flavour}</p>
	<StatRow stats={climateStats} />
	<div class="mt-4 border-t border-carbon-700 pt-4"><StatRow stats={neighbourStats} /></div>
</aside>
