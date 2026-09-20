<script lang="ts">
	import type { MatchPage } from '$lib/contracts/MatchPage';
	import { formatMoney } from '$lib/format/money';
	import GoFishingButton from '../game/GoFishingButton.svelte';
	import AboutToggle from '../stats/AboutToggle.svelte';
	import StatRow from '../stats/StatRow.svelte';

	let { page }: { page: MatchPage } = $props();

	const card = $derived(page.card);
	const match = $derived(card.match);
	const isOpen = $derived(card.phase === 'upcoming' || card.phase === 'in_play');
	const canCancel = $derived(card.isHost && card.phase === 'upcoming');
	const canFishNow = $derived(card.isEntered && card.phase === 'in_play');
	const entryWords = $derived(Number(match.entry_fee) === 0 ? 'free to enter' : `${formatMoney(match.entry_fee)} to enter`);
	const stats = $derived([
		{ label: 'Most fish', value: formatMoney(page.prizes.mostCatches), caption: `${match.most_catches_share}%` },
		{ label: 'Biggest', value: formatMoney(page.prizes.biggestFish) },
		{ label: "Host's stake", value: formatMoney(match.host_stake) },
		{ label: 'Entries', value: String(card.entryCount), caption: `of ${match.pegs} pegs` }
	]);
</script>

<section class="panel self-start">
	<p class="stat-label">The pot</p>
	<p class="mb-3 flex flex-wrap items-baseline gap-x-2"><span class="text-4xl text-volt-300">{formatMoney(card.pot)}</span>{#if isOpen}<span class="text-xs text-mist-400">{entryWords}</span>{/if}</p>
	<StatRow {stats} />
	{#if isOpen}
		<div class="mt-3"><AboutToggle title="About the pot">Every entry fee goes in the pot; ties share the prize. The water is closed to everyone else while the match runs, and entrants fish it without a day ticket.</AboutToggle></div>
	{/if}

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
