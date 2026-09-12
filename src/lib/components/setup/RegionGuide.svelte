<script lang="ts">
	import type { RegionGuide } from '$lib/contracts/RegionGuide';
	import { formatMoney } from '$lib/format/money';
	import { formatWeight } from '$lib/format/weight';

	let { guide }: { guide: RegionGuide } = $props();

	const times = (factor: number) => `×${Number(factor.toFixed(2))}`;
</script>

<aside class="panel">
	<p class="stat-label">Region guide</p>
	<h2 class="mb-1 text-2xl text-volt-300">{guide.label}</h2>
	<p class="mb-4 text-sm text-mist-200">{guide.flavour}</p>
	<dl class="grid grid-cols-2 gap-3 text-sm">
		<div><dt class="stat-label">Land</dt><dd class="text-xl text-volt-300">{formatMoney(guide.landPricePerAcre)} <span class="text-xs text-mist-400">an acre</span></dd></div>
		<div><dt class="stat-label">Growth ceiling</dt><dd class="text-xl">{guide.growthCeilingLb} lb</dd></div>
		<div><dt class="stat-label">Growth summer / winter</dt><dd class="text-xl">{times(guide.summerGrowthFactor)} / {times(guide.winterGrowthFactor)}</dd></div>
		<div><dt class="stat-label">Anglers about</dt><dd class="text-xl">{times(guide.anglerPoolFactor)} <span class="text-xs text-mist-400">paying {times(guide.willingnessToPayFactor)}</span></dd></div>
	</dl>
	<dl class="mt-4 grid grid-cols-3 gap-3 border-t border-carbon-700 pt-4 text-sm">
		<div><dt class="stat-label">Waters open</dt><dd class="text-xl">{guide.lakeCount}</dd></div>
		<div><dt class="stat-label">Biggest carp</dt><dd class="text-xl">{guide.biggestCarpLb > 0 ? formatWeight(guide.biggestCarpLb) : '—'}</dd></div>
		<div><dt class="stat-label">Day ticket</dt><dd class="text-xl">{guide.lakeCount > 0 ? formatMoney(guide.averageDayTicket) : '—'}</dd></div>
	</dl>
</aside>
