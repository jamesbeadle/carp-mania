<script lang="ts">
	import { matchTackleToWater } from '$lib/domain/fishing/tackleMatch';
	import { BaitCatalogue, BaitNames } from '$lib/domain/tackle/baits';
	import { HookFinishes, HookSizeNote, HookSizes } from '$lib/domain/tackle/hooks';
	import { LineColourLabels, LineColours, LineThicknessLabels, LineThicknesses } from '$lib/domain/tackle/lines';
	import { RigCatalogue, RigNames } from '$lib/domain/tackle/rigs';
	import type { RodSetup } from '$lib/domain/tackle/rodSetup';
	import { TubingColours, TubingLabels } from '$lib/domain/tackle/tubing';
	import type { Terrain } from '$lib/domain/layout/terrainAt';
	import type { Lake } from '$lib/domain/types';
	import { humanise } from '$lib/format/labels';

	let { setup = $bindable(), rodNumber, lake, terrain, isShowingHints }: { setup: RodSetup; rodNumber: number; lake: Lake; terrain: Terrain; isShowingHints: boolean } = $props();

	const match = $derived(matchTackleToWater(setup, lake, terrain));
	const percent = (score: number) => `${Math.round(score * 100)}%`;
</script>

<section class="panel space-y-3">
	<h3 class="text-lg text-volt-300">Rod {rodNumber}</h3>
	<div class="grid grid-cols-2 gap-2">
		<label><span class="stat-label">Line colour</span>
			<select bind:value={setup.line.colour} class="field">{#each LineColours as colour (colour)}<option value={colour}>{LineColourLabels[colour]}</option>{/each}</select></label>
		<label><span class="stat-label">Line strength</span>
			<select bind:value={setup.line.thickness} class="field">{#each LineThicknesses as thickness (thickness)}<option value={thickness}>{LineThicknessLabels[thickness]}</option>{/each}</select></label>
		<label><span class="stat-label">Hook size</span>
			<select bind:value={setup.hook.size} class="field">{#each HookSizes as size (size)}<option value={size}>Size {size}</option>{/each}</select></label>
		<label><span class="stat-label">Hook finish</span>
			<select bind:value={setup.hook.finish} class="field">{#each HookFinishes as finish (finish)}<option value={finish}>{humanise(finish)}</option>{/each}</select></label>
		<label class="col-span-2"><span class="stat-label">Rig</span>
			<select bind:value={setup.rig} class="field">{#each RigNames as rig (rig)}<option value={rig}>{RigCatalogue[rig].label}</option>{/each}</select></label>
		<label><span class="stat-label">Bait</span>
			<select bind:value={setup.bait} class="field">{#each BaitNames as bait (bait)}<option value={bait}>{BaitCatalogue[bait].label}</option>{/each}</select></label>
		<label><span class="stat-label">Shrink tubing</span>
			<select bind:value={setup.tubing} class="field">{#each TubingColours as tubing (tubing)}<option value={tubing}>{TubingLabels[tubing]}</option>{/each}</select></label>
	</div>
	<p class="text-xs text-mist-400">{HookSizeNote[setup.hook.size]}</p>
	{#if isShowingHints}
		<dl class="grid grid-cols-5 gap-1 text-center text-xs">
			<div><dt class="text-mist-400">Line</dt><dd>{percent(match.line)}</dd></div>
			<div><dt class="text-mist-400">Hook</dt><dd>{percent(match.hook)}</dd></div>
			<div><dt class="text-mist-400">Rig</dt><dd>{percent(match.rig)}</dd></div>
			<div><dt class="text-mist-400">Bait</dt><dd>{percent(match.bait)}</dd></div>
			<div><dt class="text-mist-400">Tubing</dt><dd>{percent(match.tubing)}</dd></div>
		</dl>
		<p class="text-center text-sm">Overall match <span class="font-semibold text-volt-300">{percent(match.overall)}</span></p>
	{/if}
</section>
