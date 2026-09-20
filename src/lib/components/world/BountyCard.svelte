<script lang="ts">
	import type { BountyCard } from '$lib/contracts/Bounties';
	import { BountyKindCatalogue } from '$lib/domain/bounties/bountyKinds';
	import { askWordsOf, prizeWordsOf, sponsorNameOf } from '$lib/domain/bounties/bountyWords';
	import { BandLabels } from '$lib/domain/bounties/difficultyBand';
	import { formatWhen } from '$lib/format/dates';
	import { formatMoney } from '$lib/format/money';

	let { bounty, isOnTheWater = false }: { bounty: BountyCard; isOnTheWater?: boolean } = $props();

	const sponsor = $derived(sponsorNameOf(bounty.sponsorBrand));
	const prize = $derived(prizeWordsOf(bounty, formatMoney));
	const ask = $derived(askWordsOf(bounty));
	const where = $derived(isOnTheWater ? 'here' : `at ${bounty.lakeName}`);
	const isWon = $derived(bounty.status === 'won');
</script>

<article class="rounded-xl border border-warning-500/40 bg-warning-500/10 px-4 py-3">
	<p class="text-xs tracking-wide text-warning-500 uppercase">{BountyKindCatalogue[bounty.kind].label} · {BandLabels[bounty.band]}</p>
	{#if isWon}
		<p class="mt-1 text-sm text-mist-100">{bounty.winnerName ?? 'An angler'} took {sponsor}'s bounty {where}: {prize}.</p>
	{:else}
		<p class="mt-1 text-sm text-mist-100">{sponsor} {bounty.isOwnersOwn ? 'is putting' : 'are putting'} {prize} on {ask} {where} by {formatWhen(bounty.endsAt)}.</p>
	{/if}
	{#if !isOnTheWater}<a href="/lakes/{bounty.lakeId}" class="mt-1 inline-block text-xs text-surge-400 hover:underline">See the water →</a>{/if}
</article>
