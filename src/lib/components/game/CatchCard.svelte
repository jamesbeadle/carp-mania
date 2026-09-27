<script lang="ts">
	import { formatFishingHour } from '$lib/domain/fishing/sessionClock';
	import { StrainCatalogue } from '$lib/domain/strains';
	import { formatWeight } from '$lib/format/weight';
	import type { CatchReportOutcome, LandedFish } from '$lib/game/session/landFish';
	import AwardRibbons from './AwardRibbons.svelte';
	import HonourRibbons from './HonourRibbons.svelte';
	import ScalesReadout from './ScalesReadout.svelte';

	let { landed, lakeName, catchOutcome, isSettling, onContinue }: { landed: LandedFish; lakeName: string; catchOutcome: CatchReportOutcome | null; isSettling: boolean; onContinue: () => void } = $props();

	let isWeighed = $state(false);
	const carp = $derived(landed.carp);
	const swim = $derived(landed.swim);
	const strain = $derived(StrainCatalogue[carp.strain]);
	const weightLb = $derived(Number(carp.weight_lb));
	const capturesWords = $derived(carp.times_caught === 0 ? 'Caught by you · its first time on the bank' : `Caught by you · ${carp.times_caught + 1} captures`);
</script>

<aside class="catch-card hud-glass fixed z-40 w-[min(26rem,calc(100%-1.5rem))] space-y-3 p-5">
	<p class="hud-label text-volt-400">{isWeighed ? 'Catch card' : 'On the mat · weighing'}</p>
	{#if !isWeighed}
		<ScalesReadout {weightLb} onSettled={() => (isWeighed = true)} />
	{:else}
		<h2 class="hud-figure text-4xl leading-none text-mist-100 sm:text-5xl">{carp.name}</h2>
		<p class="hud-figure text-2xl sm:text-3xl">{strain.label} · {formatWeight(weightLb)}</p>
		<p class="text-sm text-mist-200">{lakeName} · {swim.name} · {formatFishingHour(landed.hour)}</p>
		<div class="flex flex-wrap gap-2">
			<HonourRibbons honours={landed.honours} />
			{#if catchOutcome}<AwardRibbons awards={catchOutcome.awards} />{/if}
		</div>
		<p class="hud-label">{capturesWords}</p>
		<p class="text-xs text-mist-400">
			{#if catchOutcome === null}Saving the catch report…{:else if catchOutcome.isSaved}Catch report posted — your skills and the fishery's reputation went up.{:else}<span class="text-danger-400">The catch report could not be saved: {catchOutcome.reason}.</span>{/if}
		</p>
		<button class="button-primary w-full" disabled={isSettling} onclick={onContinue}>Back to the rods</button>
	{/if}
</aside>

<style>
	.catch-card {
		right: 1rem;
		bottom: max(1rem, env(safe-area-inset-bottom));
	}
	@media (min-width: 1024px) {
		.catch-card {
			right: calc(min(24rem, 40vw) + 1.5rem);
			top: 50%;
			bottom: auto;
			transform: translateY(-50%);
		}
	}
</style>
