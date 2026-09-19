<script lang="ts">
	import type { BailiffsPanel } from '$lib/contracts/BailiffsPanel';
	import { teamPerformanceOf, wagesOf } from '$lib/domain/bailiffs/bailiffTeam';
	import type { Lake } from '$lib/domain/types';
	import { formatMoney } from '$lib/format/money';
	import WaterQualityBars from '../WaterQualityBars.svelte';
	import BailiffCard from './BailiffCard.svelte';
	import CandidateCard from './CandidateCard.svelte';

	let { lake, bailiffs }: { lake: Lake; bailiffs: BailiffsPanel } = $props();

	const team = $derived(bailiffs.team);
	const isFull = $derived(team.length >= bailiffs.cap);
	const average = $derived(Math.round(teamPerformanceOf(team)));
	const wages = $derived(formatMoney(wagesOf(team)));
	const teamWords = $derived(team.length === 0 ? 'No bailiff — the water is drifting and some anglers fish for free.' : `${team.length} of ${bailiffs.cap} on the team, averaging ${average} — ${wages} a day in wages.`);
</script>

<section class="panel">
	<h3 class="mb-1 text-xl text-volt-300">Water &amp; bailiffs</h3>
	<p class="mb-4 text-sm text-mist-400">
		Silt and weed creep up every day; colour and transparency follow. A bailiff team clears weed, keeps silt down, tidies the banks and makes sure anglers pay.
		{lake.acres} acres keeps {bailiffs.cap} {bailiffs.cap === 1 ? 'bailiff' : 'bailiffs'} busy; short of that the water slowly silts up whatever their quality.
	</p>
	<WaterQualityBars {lake} />
	<p class="mt-5 mb-2 text-sm" class:text-danger-400={team.length === 0} class:text-volt-300={team.length > 0}>{teamWords}</p>
	{#if team.length > 0}
		<ul class="mb-4 divide-y divide-carbon-700/60">
			{#each team as bailiff (bailiff.id)}<BailiffCard {bailiff} />{/each}
		</ul>
	{/if}
	<h4 class="mb-1 text-sm font-medium text-mist-100">Looking for work this week</h4>
	<p class="mb-2 text-xs text-mist-400">A reference is a hint at how they will turn out, not a number. Sacking is instant and free.</p>
	<ul class="divide-y divide-carbon-700/60">
		{#each bailiffs.candidates as candidate (candidate.id)}<CandidateCard {candidate} {isFull} />{/each}
	</ul>
</section>
