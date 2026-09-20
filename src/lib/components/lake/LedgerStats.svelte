<script lang="ts">
	import type { Catch, LakeVisit } from '$lib/domain/types';
	import { formatMoney } from '$lib/format/money';
	import StatRow from '../stats/StatRow.svelte';

	let { visits, catches }: { visits: LakeVisit[]; catches: Catch[] } = $props();

	const NothingPaid = 0;
	const paid = $derived(visits.filter((visit) => Number(visit.fee_paid) > NothingPaid));
	const takings = $derived(paid.reduce((total, visit) => total + Number(visit.fee_paid), 0));
	const fishedFree = $derived(visits.length - paid.length);
	const stats = $derived([
		{ label: 'Takings', value: formatMoney(takings), caption: 'in tickets', tone: 'volt' as const },
		{ label: 'Visits', value: String(visits.length) },
		{ label: 'Fished free', value: String(fishedFree) },
		{ label: 'Catch reports', value: String(catches.length) }
	]);
</script>

<StatRow {stats} />
