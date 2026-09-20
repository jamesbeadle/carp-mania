<script lang="ts">
	import type { MatchCard } from '$lib/contracts/MatchCard';
	import type { TicketProduct } from '$lib/domain/fishing/ticketBook';
	import { streakWords } from '$lib/domain/fishing/streak';
	import { weatherWords } from '$lib/domain/fishing/weatherConditions';
	import type { Profile } from '$lib/domain/types';
	import { weatherFor } from '$lib/domain/world/weather';
	import { formatMoney } from '$lib/format/money';
	import type { LakeForAnglers } from '$lib/server/queries/GetLake';
	import TicketPicker from './TicketPicker.svelte';

	interface Props {
		water: LakeForAnglers;
		profile: Profile;
		book: TicketProduct[];
		runningMatch: MatchCard | null;
		knownCarpCount: number;
		streakIfFishedToday: number;
	}

	let { water, profile, book, runningMatch, knownCarpCount, streakIfFishedToday }: Props = $props();

	const isOwnWater = $derived(water.lake.owner_id === profile.id);
	const isBookedOut = $derived(runningMatch !== null && !runningMatch.isEntered);
	const isFishingTheMatch = $derived(runningMatch !== null && runningMatch.isEntered);
	const freeWords = $derived(isFishingTheMatch ? 'Fish the match' : 'Walk to the lake');
	const todaysWeather = $derived(weatherWords(weatherFor(water.lake, new Date())));
	const barbedWords = $derived(water.lake.is_barbed_banned ? ' Barbless only on this water.' : '');
</script>

<h1 class="mb-1 text-4xl text-volt-300">{water.lake.name}</h1>
<p class="mb-6 text-sm text-mist-400">{water.ownerName}'s water · reputation {Math.round(Number(water.lake.reputation))} · {knownCarpCount} carp</p>
<section class="panel max-w-xl">
	{#if runningMatch !== null && isBookedOut}
		<h2 class="mb-2 text-2xl text-volt-300">Booked for {runningMatch.match.title}</h2>
		<p class="mb-4 text-mist-200">The water is closed to everyone but the entrants until the match ends. Take a peg while there is one, or come back later.</p>
		<a href="/matches/{runningMatch.match.id}" class="button-secondary inline-block">See the match</a>
	{:else}
		<h2 class="mb-2 text-2xl text-volt-300">{isFishingTheMatch ? 'Match in play' : 'The ticket office'}</h2>
		<p class="mb-1 text-mist-200">
			{#if runningMatch !== null && isFishingTheMatch}You're in {runningMatch.match.title} — no ticket needed, every fish you land counts on the board.
			{:else if isOwnWater}It's your own water — no ticket needed. Pick the hours you want to sit.
			{:else}First light and the evening into the dark are when the big fish feed. You have {formatMoney(profile.money)}.{/if}{barbedWords}
		</p>
		<p class="mb-1 text-xs text-mist-400">Today: {todaysWeather}.</p>
		<p class="mb-4 text-xs text-volt-300">{streakWords(streakIfFishedToday)}</p>
		<TicketPicker {book} money={Number(profile.money)} isFree={isOwnWater || isFishingTheMatch} {freeWords} />
	{/if}
</section>
