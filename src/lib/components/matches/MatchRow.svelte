<script lang="ts">
	import type { MatchCard } from '$lib/contracts/MatchCard';
	import { formatMoney } from '$lib/format/money';
	import { timelineOf } from '$lib/game/matches/matchWords';
	import PhaseBadge from './PhaseBadge.svelte';

	let { card, now }: { card: MatchCard; now: Date } = $props();
</script>

<li class="flex flex-wrap items-baseline gap-x-3 gap-y-1 py-2 text-sm">
	<a href="/matches/{card.match.id}" class="text-mist-100 hover:underline">{card.match.title}</a>
	<span class="text-mist-400">at {card.lakeName} · {timelineOf(card.match, card.phase, now)}</span>
	<span class="ml-auto flex items-center gap-3">
		<span class="text-volt-300">{formatMoney(card.pot)}</span>
		<PhaseBadge phase={card.phase} />
	</span>
</li>
