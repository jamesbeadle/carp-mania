<script lang="ts">
	import { bookingFeeFor, MatchTerms } from '$lib/domain/matches/matchRules';
	import type { Lake } from '$lib/domain/types';
	import { formatMoney } from '$lib/format/money';
	import { LengthChoices, SplitChoices, StartChoices, suggestedTitleFor } from '$lib/game/matches/hostingChoices';
	import HostMatchCosts from './HostMatchCosts.svelte';

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
	<HostMatchCosts {lastsHours} {bookingFee} hostStake={Math.max(0, hostStake)} {cost} {fullHouse} {pegs} {money} {isOwnWater} />
	<button class="button-primary" disabled={!canAfford}>{canAfford ? 'Book the match' : `You need ${formatMoney(cost)}`}</button>
</form>
