<script lang="ts">
	import type { Lake } from '$lib/domain/types';
	import { overallWaterQuality, WaterScale } from '$lib/domain/waterQuality';

	let { lake, hasHeadline = true }: { lake: Lake; hasHeadline?: boolean } = $props();

	const Goodness = { GoodAbove: 60, FairAbove: 35 } as const;
	const quality = $derived(overallWaterQuality(Number(lake.transparency), Number(lake.weed), Number(lake.silt)));
	const readings = $derived([
		{ label: 'Transparency', value: Number(lake.transparency), isGoodWhenHigh: true },
		{ label: 'Colour', value: Number(lake.water_colour), isGoodWhenHigh: false },
		{ label: 'Weed', value: Number(lake.weed), isGoodWhenHigh: false },
		{ label: 'Silt', value: Number(lake.silt), isGoodWhenHigh: false },
		{ label: 'Bank tidiness', value: Number(lake.bank_tidiness), isGoodWhenHigh: true }
	]);

	function tone(reading: { value: number; isGoodWhenHigh: boolean }) {
		const goodness = reading.isGoodWhenHigh ? reading.value : WaterScale.Best - reading.value;
		if (goodness > Goodness.GoodAbove) return 'bg-volt-400';
		if (goodness > Goodness.FairAbove) return 'bg-surge-400';
		return 'bg-danger-400';
	}
</script>

{#if hasHeadline}<p class="mb-3 flex flex-wrap items-baseline gap-x-2 text-sm"><span>Overall water quality</span><span class="font-semibold text-volt-300">{Math.round(quality)}%</span></p>{/if}
<ul class="space-y-2">
	{#each readings as reading (reading.label)}
		<li>
			<div class="mb-1 flex justify-between gap-2 text-xs text-mist-400"><span>{reading.label}</span><span class="tabular-nums">{Math.round(reading.value)}</span></div>
			<div class="h-2 overflow-hidden rounded-full bg-carbon-950">
				<div class="h-full rounded-full {tone(reading)}" style="width: {reading.value}%"></div>
			</div>
		</li>
	{/each}
</ul>
