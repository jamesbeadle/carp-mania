<script lang="ts">
	import type { Lake } from '$lib/domain/types';
	import { overallWaterQuality } from '$lib/domain/waterQuality';

	let { lake }: { lake: Lake } = $props();

	const quality = $derived(overallWaterQuality(Number(lake.transparency), Number(lake.weed), Number(lake.silt)));
	const readings = $derived([
		{ label: 'Transparency', value: Number(lake.transparency), isGoodWhenHigh: true },
		{ label: 'Colour', value: Number(lake.water_colour), isGoodWhenHigh: false },
		{ label: 'Weed', value: Number(lake.weed), isGoodWhenHigh: false },
		{ label: 'Silt', value: Number(lake.silt), isGoodWhenHigh: false },
		{ label: 'Bank tidiness', value: Number(lake.bank_tidiness), isGoodWhenHigh: true }
	]);
	const tone = (reading: { value: number; isGoodWhenHigh: boolean }) => {
		const goodness = reading.isGoodWhenHigh ? reading.value : 100 - reading.value;
		return goodness > 60 ? 'bg-reed-400' : goodness > 35 ? 'bg-gold-400' : 'bg-danger-400';
	};
</script>

<p class="mb-3 text-sm">Overall water quality <span class="font-semibold text-gold-300">{Math.round(quality)}%</span></p>
<ul class="space-y-2">
	{#each readings as reading (reading.label)}
		<li>
			<div class="mb-1 flex justify-between text-xs text-mist-400"><span>{reading.label}</span><span>{Math.round(reading.value)}</span></div>
			<div class="h-2 overflow-hidden rounded-full bg-pond-950">
				<div class="h-full rounded-full {tone(reading)}" style="width: {reading.value}%"></div>
			</div>
		</li>
	{/each}
</ul>
