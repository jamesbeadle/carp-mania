<script lang="ts">
	import type { MatchPage } from '$lib/contracts/MatchPage';
	import { formatMoney } from '$lib/format/money';
	import { pegsWords } from '$lib/game/matches/matchWords';
	import GoFishingButton from '../game/GoFishingButton.svelte';

	let { page }: { page: MatchPage } = $props();

	const card = $derived(page.card);
	const match = $derived(card.match);
	const isOpen = $derived(card.phase === 'upcoming' || card.phase === 'in_play');
	const canCancel = $derived(card.isHost && card.phase === 'upcoming');
	const canFishNow = $derived(card.isEntered && card.phase === 'in_play');
	const entryWords = $derived(Number(match.entry_fee) === 0 ? 'Free to enter' : `${formatMoney(match.entry_fee)} to enter`);
</script>

<section class="panel self-start">
	<p class="stat-label">The pot</p>
	<p class="mb-3 text-4xl text-volt-300">{formatMoney(card.pot)}</p>
	<dl class="grid grid-cols-[1fr_auto] gap-x-4 gap-y-1 text-sm">
		<dt class="text-mist-400">Most catches</dt>
		<dd class="text-right text-mist-100">{formatMoney(page.prizes.mostCatches)} <span class="text-xs text-mist-400">({match.most_catches_share}%)</span></dd>
		<dt class="text-mist-400">Biggest fish</dt>
		<dd class="text-right text-mist-100">{formatMoney(page.prizes.biggestFish)}</dd>
		<dt class="text-mist-400">Host's stake</dt>
		<dd class="text-right text-mist-100">{formatMoney(match.host_stake)}</dd>
		<dt class="text-mist-400">Entries</dt>
		<dd class="text-right text-mist-100">{pegsWords(card.entryCount, match.pegs)}</dd>
	</dl>
	{#if isOpen}<p class="mt-3 text-xs text-mist-400">{entryWords}. Every entry fee goes in the pot; ties share the prize. The water is closed to everyone else while the match runs, and entrants fish it without a day ticket.</p>{/if}

	{#if canFishNow}
		<div class="mt-4"><GoFishingButton lakeId={match.lake_id} words="Fish the match" buttonClass="button-primary block w-full text-center" /></div>
	{:else if card.isEntered && card.phase === 'upcoming'}
		<p class="mt-4 text-sm text-volt-300">You're in. Come back when it starts and fish from the water's page.</p>
	{:else if isOpen && page.whyCannotEnter === null}
		<form method="POST" action="?/enter" class="mt-4">
			<input type="hidden" name="matchId" value={match.id} />
			<button class="button-primary w-full">Take a peg for {formatMoney(match.entry_fee)}</button>
		</form>
	{:else if isOpen}
		<p class="mt-4 text-sm text-mist-400">{page.whyCannotEnter}</p>
	{/if}

	{#if canCancel}
		<form method="POST" action="?/cancel" class="mt-3">
			<input type="hidden" name="matchId" value={match.id} />
			<button class="button-secondary w-full">Call it off</button>
			<p class="mt-1 text-xs text-mist-400">Entry fees and your stake come back; the booking fee of {formatMoney(match.booking_fee)} is spent.</p>
		</form>
	{/if}
</section>
