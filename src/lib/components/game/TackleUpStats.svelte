<script lang="ts">
	import type { Terrain } from '$lib/domain/layout/terrainAt';
	import type { Lake } from '$lib/domain/types';
	import type { Season } from '$lib/domain/world/seasons';
	import { BedTypeLabels, SwimFeatureLabels } from '$lib/format/labels';
	import StatRow from '../stats/StatRow.svelte';

	let { lake, terrain, season }: { lake: Lake; terrain: Terrain; season: Season } = $props();

	const stats = $derived([
		{ label: 'In front', value: SwimFeatureLabels[terrain.feature], caption: BedTypeLabels[terrain.bed].toLowerCase(), tone: 'volt' as const },
		{ label: 'Depth', value: `${terrain.depthFeet} ft` },
		{ label: 'Transparency', value: `${Math.round(Number(lake.transparency))}%` },
		{ label: 'Season', value: season.name }
	]);
</script>

<StatRow {stats} />
