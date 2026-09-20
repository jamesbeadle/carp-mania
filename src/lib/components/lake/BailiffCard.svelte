<script lang="ts">
	import type { Bailiff } from '$lib/domain/bailiffs/bailiffTeam';
	import { performanceWord } from '$lib/domain/bailiffs/performance';
	import { formatMoney } from '$lib/format/money';

	let { bailiff }: { bailiff: Bailiff } = $props();

	const performance = $derived(Math.round(Number(bailiff.performance)));
</script>

<li class="flex flex-wrap items-center gap-x-3 gap-y-1 py-2 text-sm">
	<span class="font-medium text-mist-100">{bailiff.name}</span>
	<span class="text-xs text-mist-400">{formatMoney(bailiff.wage)} a day</span>
	<span class="text-volt-300">{performance}</span>
	<span class="text-xs text-mist-400">{performanceWord(performance)}</span>
	<form method="POST" action="?/sackBailiff" class="ml-auto">
		<input type="hidden" name="bailiffId" value={bailiff.id} />
		<button class="button-secondary px-3 py-1 text-base">Sack</button>
	</form>
</li>
