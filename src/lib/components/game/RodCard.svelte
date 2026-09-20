<script lang="ts">
	import { describeTerrain } from '$lib/domain/fishing/castTerrain';
	import { BedTypeLabels, SwimFeatureLabels } from '$lib/format/labels';
	import type { RodOnBank } from '$lib/game/scene/rodState';
	import { pointerWords } from '$lib/game/stage/pointerWords';

	let { rod, isWide = false, onReelIn }: { rod: RodOnBank; isWide?: boolean; onReelIn?: (rodIndex: number) => void } = $props();

	const phaseLabels = { idle: pointerWords('Click water to cast'), cast: 'Fishing', biting: 'Bite!', fighting: 'Fish on' } as const;
	const phaseTone = { idle: 'text-mist-400', cast: 'text-surge-400', biting: 'text-danger-400', fighting: 'text-volt-400' } as const;

	const kit = $derived(rod.kit);
	const tackle = $derived(`${kit.rig.label} · ${kit.bait.label}`);
	const spot = $derived(rod.terrain ? describeTerrain(rod.terrain, BedTypeLabels, SwimFeatureLabels) : null);
	const isBiting = $derived(rod.phase === 'biting');
	const canReelIn = $derived(rod.phase === 'cast' && onReelIn !== undefined);
</script>

<div class="short:py-1 min-w-0 rounded-lg border bg-carbon-950/80 px-3 py-2" class:border-carbon-700={!isBiting} class:border-danger-500={isBiting} class:animate-pulse={isBiting} title={tackle}>
	<div class="flex items-baseline gap-3 font-display text-sm font-bold tracking-wide uppercase">
		<span class="truncate"><span class="text-mist-100">Rod {rod.index + 1}</span> <span class={phaseTone[rod.phase]}>· {phaseLabels[rod.phase]}</span></span>
		{#if canReelIn}<button class="ml-auto shrink-0 text-xs text-mist-400 underline hover:text-mist-100" onclick={() => onReelIn?.(rod.index)}>Reel in</button>{/if}
	</div>
	<div class="truncate text-xs text-mist-200">{spot ?? tackle}</div>
	{#if isWide && spot}<div class="short:hidden truncate text-xs text-mist-400">{tackle}</div>{/if}
</div>
