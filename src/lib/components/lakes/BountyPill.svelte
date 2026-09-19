<script lang="ts">
	import type { BountyCard } from '$lib/contracts/Bounties';
	import { askWordsOf, prizeWordsOf } from '$lib/domain/bounties/bountyWords';
	import { formatMoney } from '$lib/format/money';

	let { bounty }: { bounty: BountyCard } = $props();
</script>

<span class="inline-flex items-center gap-1 rounded-full border border-warning-500/50 bg-warning-500/15 px-3 py-1 text-xs text-warning-500">
	<span class="font-bold">£</span> Bounty: {prizeWordsOf(bounty, formatMoney)} for {askWordsOf(bounty)}
</span>
