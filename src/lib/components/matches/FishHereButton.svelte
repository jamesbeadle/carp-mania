<script lang="ts">
	import type { MatchCard } from '$lib/contracts/MatchCard';
	import type { Lake } from '$lib/domain/types';
	import { formatMoney } from '$lib/format/money';

	let { lake, runningMatch }: { lake: Lake; runningMatch: MatchCard | null } = $props();
</script>

{#if runningMatch === null}
	<a href="/fish/{lake.id}" class="button-primary">Fish here for {formatMoney(lake.day_ticket_fee)}</a>
{:else if runningMatch.isEntered}
	<a href="/fish/{lake.id}" class="button-primary">Fish the match</a>
{:else}
	<a href="/matches/{runningMatch.match.id}" class="button-secondary">Booked for {runningMatch.match.title}</a>
{/if}
