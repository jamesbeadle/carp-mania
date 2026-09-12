<script lang="ts">
	import { IslandWorks, WorkPrices } from '$lib/domain/groundworks/catalogue';
	import type { IslandSize, ShelfBed } from '$lib/domain/groundworks/workKinds';
	import { IslandSizeLabels } from '$lib/domain/groundworks/workLabels';
	import type { BuilderState } from '$lib/game/builder/builderState.svelte';
	import { BedTypeLabels } from '$lib/format/labels';
	import { formatMoney } from '$lib/format/money';

	let { builder }: { builder: BuilderState } = $props();

	const TurnStep = Math.PI / 12;
	const IslandSizes: IslandSize[] = ['small', 'medium', 'large'];
	const ShelfBeds: ShelfBed[] = ['gravel', 'clay'];
	const draft = $derived(builder.draft);

	function resize(size: IslandSize) {
		if (draft?.kind === 'island') builder.draft = { ...draft, size };
	}

	function turn(by: number) {
		if (draft?.kind === 'island') builder.draft = { ...draft, rotation: draft.rotation + by };
	}

	function rename(name: string) {
		if (draft?.kind === 'island' || draft?.kind === 'snag') builder.draft = { ...draft, name };
	}

	function setDepth(depthFeet: number) {
		if (draft?.kind === 'deepen' || draft?.kind === 'gravel_bar') builder.draft = { ...draft, depthFeet };
	}

	function setBed(bed: ShelfBed) {
		if (draft?.kind === 'margin_shelf') builder.draft = { ...draft, bed };
	}
</script>

{#if draft?.kind === 'island'}
	<div class="flex gap-1">
		{#each IslandSizes as size (size)}
			<button class="flex-1 rounded-md border border-carbon-600 px-2 py-1 text-sm" class:bg-volt-500={draft.size === size} class:text-carbon-950={draft.size === size} onclick={() => resize(size)}>
				{IslandSizeLabels[size]} · {formatMoney(IslandWorks[size].cost)}
			</button>
		{/each}
	</div>
	<div class="flex gap-2">
		<button class="button-secondary flex-1 px-2 py-1 text-base" onclick={() => turn(-TurnStep)}>⟲ Turn</button>
		<button class="button-secondary flex-1 px-2 py-1 text-base" onclick={() => turn(TurnStep)}>⟳ Turn</button>
	</div>
{/if}
{#if draft?.kind === 'island' || draft?.kind === 'snag'}
	<label>
		<span class="stat-label">Name</span>
		<input class="field" value={draft.name} oninput={(event) => rename(event.currentTarget.value)} />
	</label>
{/if}
{#if draft?.kind === 'deepen'}
	<label>
		<span class="stat-label">Depth (ft)</span>
		<input type="number" class="field" min={WorkPrices.Deepen.minimumDepthFeet} max={WorkPrices.Deepen.maximumDepthFeet} value={draft.depthFeet} oninput={(event) => setDepth(Number(event.currentTarget.value))} />
	</label>
{/if}
{#if draft?.kind === 'gravel_bar'}
	<label>
		<span class="stat-label">Top of the bar (ft)</span>
		<input type="number" class="field" min={WorkPrices.BarDepth.minimumFeet} max={WorkPrices.BarDepth.maximumFeet} value={draft.depthFeet} oninput={(event) => setDepth(Number(event.currentTarget.value))} />
	</label>
{/if}
{#if draft?.kind === 'margin_shelf'}
	<label>
		<span class="stat-label">Bed</span>
		<select class="field" value={draft.bed} onchange={(event) => setBed(event.currentTarget.value as ShelfBed)}>
			{#each ShelfBeds as bed (bed)}<option value={bed}>{BedTypeLabels[bed]}</option>{/each}
		</select>
	</label>
{/if}
