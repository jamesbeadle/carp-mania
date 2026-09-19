<script lang="ts">
	import { StrainCatalogue } from '$lib/domain/strains';
	import { formatFishingHour } from '$lib/domain/fishing/sessionClock';
	import { drawCarpPortrait } from '$lib/game/render/drawCarpPortrait';
	import type { CatchReportOutcome, LandedFish } from '$lib/game/session/landFish';
	import { SwimFeatureLabels } from '$lib/format/labels';
	import AwardRibbons from './AwardRibbons.svelte';
	import HonourRibbons from './HonourRibbons.svelte';
	import ScalesReadout from './ScalesReadout.svelte';

	let { landed, anglerName, lakeName, catchOutcome, isSettling, onContinue }: { landed: LandedFish; anglerName: string; lakeName: string; catchOutcome: CatchReportOutcome | null; isSettling: boolean; onContinue: () => void } = $props();

	let canvas: HTMLCanvasElement;
	let isWeighed = $state(false);
	const PhotoSize = { Width: 520, Height: 320 } as const;
	const isNewToTheBook = $derived(!landed.carp.is_catalogued);
	const spot = $derived(`${SwimFeatureLabels[landed.terrain.feature].toLowerCase()} in ${landed.terrain.depthFeet} ft`);

	$effect(() => {
		const context = canvas.getContext('2d');
		if (!context) return;
		let handle = 0;
		const start = performance.now();
		const frame = (now: number) => {
			drawCarpPortrait(context, landed.carp.strain, Number(landed.carp.weight_lb), PhotoSize.Width, PhotoSize.Height, (now - start) / 1000);
			handle = requestAnimationFrame(frame);
		};
		handle = requestAnimationFrame(frame);
		return () => cancelAnimationFrame(handle);
	});
</script>

<section class="panel space-y-4">
	<p class="stat-label">In the net at {formatFishingHour(landed.hour)}</p>
	<ScalesReadout weightLb={Number(landed.carp.weight_lb)} onSettled={() => (isWeighed = true)} />
	{#if isWeighed}
		<h2 class="text-3xl text-volt-300">{landed.carp.name}</h2>
		<HonourRibbons honours={landed.honours} />
		{#if catchOutcome}<AwardRibbons awards={catchOutcome.awards} bountyWon={catchOutcome.bountyWon} />{/if}
	{/if}
	<canvas bind:this={canvas} width={PhotoSize.Width} height={PhotoSize.Height} class="w-full rounded-xl border-4 border-mist-100"></canvas>
	{#if isWeighed}
		<p class="text-sm text-mist-200">
			A {StrainCatalogue[landed.carp.strain].label.toLowerCase()} carp for {anglerName} at {lakeName}, from {landed.swim.name}, cast to the {spot}.
			{#if isNewToTheBook}Nobody had seen this fish before — it's now in the book as {landed.carp.name}.{:else if landed.carp.times_caught === 0}First time this fish has been on the bank.{:else}Caught {landed.carp.times_caught} times before.{/if}
			{#if landed.carp.fame > 0}<span class="text-volt-300">Fame {landed.carp.fame}.</span>{/if}
		</p>
		<p class="text-xs text-mist-400">
			{#if catchOutcome === null}Saving the catch report…{:else if catchOutcome.isSaved}Catch report posted — your skills and the fishery's reputation went up.{:else}<span class="text-danger-400">The catch report could not be saved: {catchOutcome.reason}.</span>{/if}
		</p>
		<button class="button-primary" disabled={isSettling} onclick={onContinue}>Back to the rods</button>
	{/if}
</section>
