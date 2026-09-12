<script lang="ts">
	import { bookingFeeFor, MatchTerms } from '$lib/domain/matches/matchRules';
	import type { Lake } from '$lib/domain/types';
	import { formatMoney } from '$lib/format/money';
	import { LengthChoices, SplitChoices, StartChoices, suggestedTitleFor } from '$lib/game/matches/hostingChoices';

	interface Props {
		lake: Lake;
		pegs: number;
		money: number;
		isOwnWater: boolean;
	}

	let { lake, pegs, money, isOwnWater }: Props = $props();

	const DefaultLength = 3;
	const DefaultEntryFee = 20;

	let lastsHours = $state(DefaultLength);
	let hostStake = $state(0);
	let entryFee = $state(DefaultEntryFee);

	const bookingFee = $derived(bookingFeeFor(Number(lake.day_ticket_fee), lastsHours, isOwnWater));
	const cost = $derived(bookingFee + Math.max(0, hostStake));
	const canAfford = $derived(money >= cost);
	const fullHouse = $derived(Math.max(0, entryFee) * pegs + Math.max(0, hostStake));
</script>

<form method="POST" action="?/host" class="panel grid gap-4">
	<label class="block">
		<span class="stat-label">The match</span>
		<input name="title" class="field mt-1" value={suggestedTitleFor(lake.name)} minlength={MatchTerms.Title.Shortest} maxlength={MatchTerms.Title.Longest} required />
	</label>
	<div class="grid gap-4 sm:grid-cols-2">
		<label class="block">
			<span class="stat-label">Starts</span>
			<select name="startsInHours" class="field mt-1">{#each StartChoices as choice (choice.hours)}<option value={choice.hours}>{choice.label}</option>{/each}</select>
		</label>
		<label class="block">
			<span class="stat-label">Lasts</span>
			<select name="lastsHours" class="field mt-1" bind:value={lastsHours}>{#each LengthChoices as choice (choice.hours)}<option value={choice.hours}>{choice.label}</option>{/each}</select>
		</label>
		<label class="block">
			<span class="stat-label">Entry fee (£)</span>
			<input name="entryFee" type="number" class="field mt-1" min="0" max={MatchTerms.LargestEntryFee} step="1" bind:value={entryFee} />
		</label>
		<label class="block">
			<span class="stat-label">Your stake (£)</span>
			<input name="hostStake" type="number" class="field mt-1" min="0" max={MatchTerms.LargestStake} step="1" bind:value={hostStake} />
		</label>
	</div>
	<label class="block">
		<span class="stat-label">The split</span>
		<select name="mostCatchesShare" class="field mt-1">{#each SplitChoices as choice (choice.share)}<option value={choice.share} selected={choice.share === MatchTerms.Splits[2]}>{choice.label}</option>{/each}</select>
	</label>
	<dl class="grid grid-cols-[1fr_auto] gap-x-4 gap-y-1 rounded-xl border border-carbon-600/80 bg-carbon-900/60 p-3 text-sm">
		<dt class="text-mist-400">Booking the water for {lastsHours} hours</dt>
		<dd class="text-right text-mist-100">{isOwnWater ? 'your own water — nothing' : formatMoney(bookingFee)}</dd>
		<dt class="text-mist-400">Your stake</dt>
		<dd class="text-right text-mist-100">{formatMoney(Math.max(0, hostStake))}</dd>
		<dt class="text-mist-100">To pay now</dt>
		<dd class="text-right text-xl text-volt-300">{formatMoney(cost)}</dd>
		<dt class="text-mist-400">Pot with every peg taken ({pegs})</dt>
		<dd class="text-right text-mist-100">{formatMoney(fullHouse)}</dd>
	</dl>
	<p class="text-xs text-mist-400">
		{isOwnWater ? 'Your own anglers stay away while the match runs, so the day tickets you would have sold are the price.' : `The owner gets the booking fee — six anglers' tickets an hour — and their water is closed to everyone but your entrants.`}
		You have {formatMoney(money)}.
	</p>
	<button class="button-primary" disabled={!canAfford}>{canAfford ? 'Book the match' : `You need ${formatMoney(cost)}`}</button>
</form>
