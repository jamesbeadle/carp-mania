<script lang="ts">
	import { Pressure, pressureWariness, pressureWords } from '$lib/domain/water/pressure';
	import StatTile from '../stats/StatTile.svelte';

	let { recentCaptures }: { recentCaptures: number } = $props();

	const wariness = $derived(pressureWariness(recentCaptures));
	const isWary = $derived(recentCaptures >= Pressure.WaryFrom);
	const tone = $derived(isWary ? ('warning' as const) : ('mist' as const));
	const caption = $derived(isWary ? `${Math.round(wariness * 100)}% off its take` : 'this week');
</script>

<StatTile label="Pressure" value="{recentCaptures}×" {caption} verdict={pressureWords(recentCaptures)} share={wariness / Pressure.MostWariness} {tone} />
