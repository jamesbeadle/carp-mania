<script lang="ts">
	import { BaitCatalogue } from '$lib/domain/tackle/baits';
	import { RigCatalogue } from '$lib/domain/tackle/rigs';
	import type { RodOnBank } from '$lib/game/scene/rodState';

	let { rods }: { rods: RodOnBank[] } = $props();

	const phaseLabels = { idle: 'Click water to cast', cast: 'Fishing', biting: 'Bite!', fighting: 'Fish on' } as const;
	const phaseTone = { idle: 'text-mist-400', cast: 'text-surge-400', biting: 'text-danger-400', fighting: 'text-volt-400' } as const;
</script>

<div class="pointer-events-none absolute bottom-3 left-3 flex flex-wrap gap-2">
	{#each rods as rod (rod.index)}
		<div class="rounded-lg border bg-carbon-950/80 px-3 py-1.5 backdrop-blur" class:border-carbon-700={rod.phase !== 'biting'} class:border-danger-500={rod.phase === 'biting'}>
			<div class="font-display text-sm font-bold tracking-wide uppercase"><span class="text-mist-100">Rod {rod.index + 1}</span> <span class={phaseTone[rod.phase]}>· {phaseLabels[rod.phase]}</span></div>
			<div class="text-[11px] text-mist-400">{RigCatalogue[rod.setup.rig].label} · {BaitCatalogue[rod.setup.bait].label}</div>
		</div>
	{/each}
</div>
