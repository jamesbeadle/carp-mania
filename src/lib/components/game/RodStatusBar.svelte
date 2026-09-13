<script lang="ts">
	import { describeTerrain } from '$lib/domain/fishing/castTerrain';
	import { BaitCatalogue } from '$lib/domain/tackle/baits';
	import { RigCatalogue } from '$lib/domain/tackle/rigs';
	import { BedTypeLabels, SwimFeatureLabels } from '$lib/format/labels';
	import type { RodOnBank } from '$lib/game/scene/rodState';
	import { pointerWords } from '$lib/game/stage/pointerWords';

	let { rods, isDocked = false, onReelIn }: { rods: RodOnBank[]; isDocked?: boolean; onReelIn?: (rodIndex: number) => void } = $props();

	const phaseLabels = { idle: pointerWords('Click water to cast'), cast: 'Fishing', biting: 'Bite!', fighting: 'Fish on' } as const;
	const phaseTone = { idle: 'text-mist-400', cast: 'text-surge-400', biting: 'text-danger-400', fighting: 'text-volt-400' } as const;
	const RodKeys = ['1', '2', '3'];

	function reelInOnNumber(event: KeyboardEvent) {
		const rodIndex = RodKeys.indexOf(event.key);
		if (rodIndex === -1 || event.target instanceof HTMLInputElement) return;
		onReelIn?.(rodIndex);
	}
</script>

<svelte:window onkeydown={reelInOnNumber} />

<div class="pointer-events-none flex flex-wrap gap-2" class:absolute={!isDocked} class:bottom-3={!isDocked} class:left-3={!isDocked}>
	{#each rods as rod (rod.index)}
		<div class="rounded-lg border bg-carbon-950/80 px-3 py-1.5 backdrop-blur" class:border-carbon-700={rod.phase !== 'biting'} class:border-danger-500={rod.phase === 'biting'} class:animate-pulse={rod.phase === 'biting'}>
			<div class="flex items-baseline gap-3 font-display text-sm font-bold tracking-wide uppercase">
				<span><span class="text-mist-100">Rod {rod.index + 1}</span> <span class={phaseTone[rod.phase]}>· {phaseLabels[rod.phase]}</span></span>
				{#if rod.phase === 'cast' && onReelIn}<button class="pointer-events-auto ml-auto text-xs text-mist-400 underline hover:text-mist-100" onclick={() => onReelIn(rod.index)}>Reel in</button>{/if}
			</div>
			<div class="text-[11px] text-mist-400">{RigCatalogue[rod.setup.rig].label} · {BaitCatalogue[rod.setup.bait].label}</div>
			{#if rod.terrain}<div class="text-[11px] text-mist-200">{describeTerrain(rod.terrain, BedTypeLabels, SwimFeatureLabels)}</div>{/if}
		</div>
	{/each}
</div>
