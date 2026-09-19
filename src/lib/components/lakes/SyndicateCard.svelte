<script lang="ts">
	import type { Lake } from '$lib/domain/types';
	import { isSyndicateWater, placesOnSale, syndicateWords } from '$lib/domain/water/syndicate';
	import { formatMoney } from '$lib/format/money';

	let { lake, isMember }: { lake: Lake; isMember: boolean } = $props();

	const canJoin = $derived(isSyndicateWater(lake) && placesOnSale(lake) > 0 && !isMember);
</script>

<section class="panel self-start">
	<p class="stat-label">The syndicate</p>
	<p class="mt-1 text-sm text-mist-200">{syndicateWords(lake)}</p>
	{#if isMember}
		<p class="mt-2 text-sm text-volt-300">You are a member this year — fish free whenever you like.</p>
	{:else if canJoin}
		<form method="POST" action="?/joinSyndicate" class="mt-3">
			<button class="button-primary">Join for {formatMoney(lake.syndicate_price)} a year</button>
		</form>
	{/if}
</section>
