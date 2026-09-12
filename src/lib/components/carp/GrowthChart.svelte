<script lang="ts">
	import type { GrowthPoint } from '$lib/contracts/CarpDossier';
	import { formatWhen } from '$lib/format/dates';
	import { formatWeight } from '$lib/format/weight';

	let { points }: { points: GrowthPoint[] } = $props();

	const Chart = { Width: 320, Height: 72, Inset: 8, MinimumWeightSpanLb: 0.5, MarkerRadius: 4 } as const;

	const first = $derived(points[0]);
	const last = $derived(points[points.length - 1]);
	const plotted = $derived(plot(points));
	const polyline = $derived(plotted.map((mark) => `${mark.x.toFixed(1)},${mark.y.toFixed(1)}`).join(' '));

	function plot(series: GrowthPoint[]) {
		const times = series.map((point) => new Date(point.at).getTime());
		const weights = series.map((point) => point.weightLb);
		const earliest = Math.min(...times);
		const lightest = Math.min(...weights);
		const timeSpan = Math.max(1, Math.max(...times) - earliest);
		const weightSpan = Math.max(Chart.MinimumWeightSpanLb, Math.max(...weights) - lightest);
		const plotWidth = Chart.Width - Chart.Inset * 2;
		const plotHeight = Chart.Height - Chart.Inset * 2;
		return series.map((point, index) => ({
			x: Chart.Inset + ((times[index] - earliest) / timeSpan) * plotWidth,
			y: Chart.Height - Chart.Inset - ((weights[index] - lightest) / weightSpan) * plotHeight,
			label: `${formatWeight(point.weightLb)} · ${formatWhen(point.at)}`
		}));
	}
</script>

{#if points.length < 2}
	<p class="text-sm text-mist-400">The chart starts with the first catch.</p>
{:else}
	<svg viewBox="0 0 {Chart.Width} {Chart.Height}" class="h-20 w-full text-volt-400" role="img" aria-label="Weight over time, from {formatWeight(first.weightLb)} to {formatWeight(last.weightLb)}">
		<polyline points={polyline} fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" stroke-linecap="round" />
		{#each plotted as mark, index (index)}
			<circle cx={mark.x} cy={mark.y} r={Chart.MarkerRadius} fill="currentColor" stroke="var(--color-carbon-800)" stroke-width="2"><title>{mark.label}</title></circle>
		{/each}
	</svg>
	<div class="flex justify-between text-xs text-mist-400">
		<span>{formatWeight(first.weightLb)} · {formatWhen(first.at)}</span>
		<span>{formatWeight(last.weightLb)} · now</span>
	</div>
{/if}
