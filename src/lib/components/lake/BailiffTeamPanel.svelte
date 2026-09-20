<script lang="ts">
	import type { BailiffsPanel } from '$lib/contracts/BailiffsPanel';
	import { BailiffTerms } from '$lib/domain/bailiffs/bailiffTeam';
	import type { Lake } from '$lib/domain/types';
	import WaterQualityBars from '../WaterQualityBars.svelte';
	import AboutToggle from '../stats/AboutToggle.svelte';
	import BailiffCard from './BailiffCard.svelte';
	import BailiffStats from './BailiffStats.svelte';
	import CandidateCard from './CandidateCard.svelte';

	let { lake, bailiffs }: { lake: Lake; bailiffs: BailiffsPanel } = $props();

	const team = $derived(bailiffs.team);
	const isFull = $derived(team.length >= bailiffs.cap);
	const hasTeam = $derived(team.length > 0);
</script>

<section class="panel">
	<h3 class="mb-3 text-xl text-volt-300">Water &amp; bailiffs</h3>
	<BailiffStats {lake} {team} cap={bailiffs.cap} />
	{#if !hasTeam}<p class="mt-3 text-sm text-danger-400">No bailiff — the water is drifting and some anglers fish for free.</p>{/if}
	<div class="mt-5"><WaterQualityBars {lake} hasHeadline={false} /></div>
	{#if hasTeam}
		<ul class="mt-5 divide-y divide-carbon-700/60">
			{#each team as bailiff (bailiff.id)}<BailiffCard {bailiff} />{/each}
		</ul>
	{/if}
	<h4 class="mt-5 mb-1 text-sm font-medium text-mist-100">Looking for work this week</h4>
	<ul class="divide-y divide-carbon-700/60">
		{#each bailiffs.candidates as candidate (candidate.id)}<CandidateCard {candidate} {isFull} />{/each}
	</ul>
	<div class="mt-4">
		<AboutToggle title="About bailiffs">
			Silt and weed creep up every day; colour and transparency follow. A bailiff clears weed, keeps silt down, tidies the banks and makes sure anglers pay, and one keeps about {BailiffTerms.AcresPerBailiff} acres in order; short of the team the water slowly silts up whatever their quality. A reference is a hint at how a candidate will turn out, not a number. Sacking is instant and free.
		</AboutToggle>
	</div>
</section>
