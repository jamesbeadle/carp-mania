<script lang="ts">
	import type { LabelledWork } from '$lib/contracts/MyGroundworks';
	import type { WorkStatus } from '$lib/domain/worldTypes';
	import { formatMoney } from '$lib/format/money';
	import StatRow from '../stats/StatRow.svelte';

	let { inProgress, ledger }: { inProgress: LabelledWork[]; ledger: LabelledWork[] } = $props();

	const Finished: WorkStatus = 'complete';
	const Idle = '—';
	const costOf = (works: LabelledWork[]) => works.reduce((total, work) => total + Number(work.cost), 0);
	const daysWord = (days: number) => (days === 1 ? 'day' : 'days');
	const built = $derived(ledger.filter((work) => work.status === Finished));
	const hasWorks = $derived(inProgress.length > 0);
	const soonestDays = $derived(hasWorks ? Math.min(...inProgress.map((work) => work.daysLeft)) : null);
	const stats = $derived([
		{ label: 'In progress', value: String(inProgress.length), caption: hasWorks ? `${formatMoney(costOf(inProgress))} committed` : 'diggers idle', tone: 'volt' as const },
		{ label: 'Next finishes', value: soonestDays === null ? Idle : String(soonestDays), caption: soonestDays === null ? '' : daysWord(soonestDays) },
		{ label: 'Built', value: String(built.length), caption: built.length === 1 ? 'work finished' : 'works finished' },
		{ label: 'Spent on works', value: formatMoney(costOf(built)) }
	]);
</script>

<StatRow {stats} />
