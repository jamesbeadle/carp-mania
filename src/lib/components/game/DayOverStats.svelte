<script lang="ts">
	import type { LandedFish } from '$lib/game/session/landFish';
	import type { Carp } from '$lib/domain/types';
	import { formatWeight } from '$lib/format/weight';
	import StatRow from '../stats/StatRow.svelte';

	let { landed, lost, nuisance }: { landed: LandedFish[]; lost: number; nuisance: Carp[] } = $props();

	const NoFish = '—';
	const heaviestLb = $derived(landed.reduce((best, fish) => Math.max(best, Number(fish.carp.weight_lb)), 0));
	const stats = $derived([
		{ label: 'Landed', value: String(landed.length), caption: 'carp', tone: 'volt' as const },
		{ label: 'Lost', value: String(lost) },
		{ label: 'Nuisance', value: String(nuisance.length), caption: 'not counted' },
		{ label: 'Best', value: heaviestLb > 0 ? formatWeight(heaviestLb) : NoFish }
	]);
</script>

<StatRow {stats} />
