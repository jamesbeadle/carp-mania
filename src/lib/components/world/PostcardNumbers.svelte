<script lang="ts">
	import type { PostcardNumbers } from '$lib/contracts/LakePostcard';
	import { formatMoney } from '$lib/format/money';
	import { formatWeight } from '$lib/format/weight';

	let { numbers }: { numbers: PostcardNumbers } = $props();

	const AcresDecimals = 1;

	const onTheBankLine = $derived(anglersLine(numbers.anglersOnBankNow));

	function anglersLine(count: number) {
		if (count === 0) return 'nobody on the bank';
		return count === 1 ? '1 angler on the bank' : `${count} anglers on the bank`;
	}
</script>

<dl class="grid grid-cols-2 gap-x-3 gap-y-2 text-sm">
	<div><dt class="stat-label">Reputation</dt><dd class="text-xl">{Math.round(numbers.reputation)}</dd></div>
	<div><dt class="stat-label">Water</dt><dd class="text-xl">{Number(numbers.acres).toFixed(AcresDecimals)} acres</dd></div>
	<div><dt class="stat-label">Biggest</dt><dd class="text-xl text-volt-300">{formatWeight(numbers.heaviestLb)}</dd></div>
	<div><dt class="stat-label">Day ticket</dt><dd class="text-xl">{formatMoney(numbers.dayTicketFee)}</dd></div>
</dl>
<p class="text-sm text-mist-400">{onTheBankLine}</p>
