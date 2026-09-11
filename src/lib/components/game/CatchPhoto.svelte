<script lang="ts">
	import { StrainCatalogue } from '$lib/domain/strains';
	import { formatFishingHour } from '$lib/domain/fishing/sessionClock';
	import { drawCarpPortrait } from '$lib/game/render/drawCarpPortrait';
	import type { LandedFish } from '$lib/game/session/landFish';
	import { formatWeight } from '$lib/format/weight';

	let { landed, anglerName, lakeName, isSaved, onContinue }: { landed: LandedFish; anglerName: string; lakeName: string; isSaved: boolean | null; onContinue: () => void } = $props();

	let canvas: HTMLCanvasElement;
	const PhotoSize = { Width: 520, Height: 320 } as const;

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
	<p class="stat-label">On the mat at {formatFishingHour(landed.hour)}</p>
	<h2 class="text-3xl text-volt-300">{landed.carp.name} — {formatWeight(landed.carp.weight_lb)}</h2>
	<canvas bind:this={canvas} width={PhotoSize.Width} height={PhotoSize.Height} class="w-full rounded-xl border-4 border-mist-100"></canvas>
	<p class="text-sm text-mist-200">
		A {StrainCatalogue[landed.carp.strain].label.toLowerCase()} carp for {anglerName} at {lakeName}, from {landed.swim.name}.
		{#if landed.carp.times_caught === 0}First time this fish has been on the bank.{:else}Caught {landed.carp.times_caught} times before.{/if}
	</p>
	<p class="text-xs text-mist-400">
		{#if isSaved === null}Saving the catch report…{:else if isSaved}Catch report posted — your skills and the fishery's reputation went up.{:else}The catch report could not be saved.{/if}
	</p>
	<button class="button-primary" onclick={onContinue}>Back to the rods</button>
</section>
