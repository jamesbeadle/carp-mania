<script lang="ts">
	import { honourKindsOf, HonourWords } from '$lib/domain/fishing/honours';
	import type { LandedFish } from '$lib/game/session/landFish';
	import { formatWeight } from '$lib/format/weight';
	import DayOverStats from './DayOverStats.svelte';
	import GoFishingButton from './GoFishingButton.svelte';
	import NuisanceBite from './NuisanceBite.svelte';
	import type { Carp } from '$lib/domain/types';

	interface Props {
		landed: LandedFish[];
		lost: number;
		nuisance: Carp[];
		lakeId: string;
		visitId: string;
		sessionsLeft: number;
		endWords: string;
	}

	let { landed, lost, nuisance, lakeId, visitId, sessionsLeft, endWords }: Props = $props();

	const hasAnotherSession = $derived(sessionsLeft > 1);
	const isABlank = $derived(landed.length === 0);
	const bestHonourOf = (fish: LandedFish) => honourKindsOf(fish.honours)[0] ?? null;
</script>

<section class="panel grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] lg:items-start">
	<div class="space-y-4">
		<p class="stat-label">{endWords}</p>
		<h2 class="text-3xl text-volt-300">{isABlank ? 'Rods in — a blank' : 'Rods in'}</h2>
		<DayOverStats {landed} {lost} {nuisance} />
		{#if isABlank}<p class="text-sm text-mist-200">It happens to everyone — try a different swim or bait tomorrow.</p>{/if}
		<NuisanceBite {nuisance} />
		<div class="flex flex-wrap gap-3">
			{#if hasAnotherSession}
				<form method="POST" action="?/nextSession">
					<input type="hidden" name="visit" value={visitId} />
					<button class="button-primary">Sit the next day · {sessionsLeft - 1} left on the ticket</button>
				</form>
			{/if}
			<GoFishingButton {lakeId} words="Fish another day here" buttonClass={hasAnotherSession ? 'button-secondary' : 'button-primary'} />
			<a href="/lakes" class="button-secondary">Choose another water</a>
			<a href="/angler" class="button-secondary">My angler</a>
		</div>
	</div>
	<ul class="grid gap-2 text-sm lg:grid-cols-2">
		{#each landed as fish, index (index)}
			{@const honour = bestHonourOf(fish)}
			{@const { carp, swim } = fish}
			<li class="flex flex-wrap items-baseline gap-x-2 rounded-lg bg-carbon-900 px-3 py-2">
				<span class="font-display text-lg font-extrabold text-volt-300 italic tabular-nums">{formatWeight(carp.weight_lb)}</span>
				<span class="text-mist-100">{carp.name}</span>
				<span class="text-xs text-mist-400">from {swim.name}</span>
				{#if honour}<span class="rounded-full bg-volt-500/15 px-2 text-xs text-volt-300">{HonourWords[honour]}</span>{/if}
			</li>
		{/each}
	</ul>
</section>
