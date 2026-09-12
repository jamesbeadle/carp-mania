<script lang="ts">
	import type { MatchCard } from '$lib/contracts/MatchCard';
	import { formatMoney } from '$lib/format/money';
	import { pegsWords, timelineOf } from '$lib/game/matches/matchWords';
	import PhaseBadge from './PhaseBadge.svelte';

	let { card, now }: { card: MatchCard; now: Date } = $props();

	const match = $derived(card.match);
	const isFree = $derived(Number(match.entry_fee) === 0);
</script>

<article class="panel flex flex-col gap-3">
	<div class="flex items-start gap-2">
		<div class="min-w-0">
			<p class="stat-label">{card.lakeName} · {card.ownerName}'s water</p>
			<h2 class="text-2xl text-volt-300"><a href="/matches/{match.id}" class="hover:underline">{match.title}</a></h2>
			<p class="text-sm text-mist-400">Hosted by {card.hostName} · {timelineOf(match, card.phase, now)}</p>
		</div>
		<div class="ml-auto"><PhaseBadge phase={card.phase} /></div>
	</div>
	<dl class="grid grid-cols-3 gap-2 text-sm">
		<div><dt class="stat-label">Pot</dt><dd class="text-xl text-volt-300">{formatMoney(card.pot)}</dd></div>
		<div><dt class="stat-label">To enter</dt><dd class="text-xl">{isFree ? 'Free' : formatMoney(match.entry_fee)}</dd></div>
		<div><dt class="stat-label">Pegs</dt><dd class="text-xl">{card.entryCount}<span class="text-sm text-mist-400"> / {match.pegs}</span></dd></div>
	</dl>
	<div class="mt-auto flex items-center gap-3 text-sm">
		{#if card.isHost}<span class="text-surge-400">You're hosting</span>{:else if card.isEntered}<span class="text-volt-300">You're in</span>{:else}<span class="text-mist-400">{pegsWords(card.entryCount, match.pegs)}</span>{/if}
		<a href="/matches/{match.id}" class="button-secondary ml-auto">{card.phase === 'upcoming' ? 'See the match' : 'The board'}</a>
	</div>
</article>
