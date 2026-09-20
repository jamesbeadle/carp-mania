<script lang="ts">
	import { BailiffTerms, teamPerformanceOf, wagesOf, type Bailiff } from '$lib/domain/bailiffs/bailiffTeam';
	import { performanceWord } from '$lib/domain/bailiffs/performance';
	import type { Lake } from '$lib/domain/types';
	import { overallWaterQuality } from '$lib/domain/waterQuality';
	import { formatMoney } from '$lib/format/money';
	import StatRow from '../stats/StatRow.svelte';

	let { lake, team, cap }: { lake: Lake; team: Bailiff[]; cap: number } = $props();

	const NoTeam = '—';
	const acres = $derived(Number(lake.acres));
	const quality = $derived(Math.round(overallWaterQuality(Number(lake.transparency), Number(lake.weed), Number(lake.silt))));
	const acresCovered = $derived(Math.min(acres, team.length * BailiffTerms.AcresPerBailiff));
	const performance = $derived(Math.round(teamPerformanceOf(team)));
	const hasTeam = $derived(team.length > 0);
	const stats = $derived([
		{ label: 'Water quality', value: `${quality}%`, tone: 'volt' as const },
		{ label: 'Acres covered', value: String(acresCovered), caption: `of ${acres} · ${team.length} of ${cap} bailiffs` },
		{ label: 'Wages a day', value: formatMoney(wagesOf(team)) },
		{ label: 'Performance', value: hasTeam ? String(performance) : NoTeam, caption: hasTeam ? performanceWord(performance) : 'no bailiff' }
	]);
</script>

<StatRow {stats} />
