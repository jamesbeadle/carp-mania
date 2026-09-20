<script lang="ts">
	import type { PostcardNumbers } from '$lib/contracts/LakePostcard';
	import { formatMoney } from '$lib/format/money';
	import { formatWeight } from '$lib/format/weight';
	import StatRow from '../stats/StatRow.svelte';

	let { numbers }: { numbers: PostcardNumbers } = $props();

	const AcresDecimals = 1;

	const onTheBankLine = $derived(anglersLine(numbers.anglersOnBankNow));
	const stats = $derived([
		{ label: 'Reputation', value: String(Math.round(numbers.reputation)) },
		{ label: 'Water', value: Number(numbers.acres).toFixed(AcresDecimals), caption: 'acres' },
		{ label: 'Biggest', value: formatWeight(numbers.heaviestLb), tone: 'volt' as const },
		{ label: 'Day ticket', value: formatMoney(numbers.dayTicketFee) }
	]);

	function anglersLine(count: number) {
		if (count === 0) return 'nobody on the bank';
		return count === 1 ? '1 angler on the bank' : `${count} anglers on the bank`;
	}
</script>

<StatRow {stats} />
<p class="text-sm text-mist-400">{onTheBankLine}</p>
