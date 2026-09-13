<script lang="ts">
	import type { Milestone } from '$lib/contracts/TrophyRoom';
	import { MilestoneCatalogue, MilestoneKinds } from '$lib/domain/trophies/milestones';
	import { formatWhen } from '$lib/format/dates';

	let { milestones }: { milestones: Milestone[] } = $props();

	const reachedAt = $derived(new Map(milestones.map((milestone) => [milestone.kind, milestone.reachedAt])));
	const reachedCount = $derived(milestones.filter((milestone) => milestone.reachedAt !== null).length);
</script>

<section class="panel">
	<h2 class="mb-1 text-xl text-volt-300">Milestones</h2>
	<p class="mb-3 text-xs text-mist-400">{reachedCount} of {MilestoneKinds.length} passed.</p>
	<ul class="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
		{#each MilestoneKinds as kind (kind)}
			{@const when = reachedAt.get(kind) ?? null}
			<li class={['rounded-xl border px-3 py-2', when ? 'border-volt-500/50 bg-volt-500/10' : 'border-carbon-700 opacity-60']} title={MilestoneCatalogue[kind].words}>
				<p class={['font-display text-base font-bold tracking-wide uppercase', when ? 'text-volt-300' : 'text-mist-400']}>{MilestoneCatalogue[kind].label}</p>
				<p class="text-xs text-mist-400">{when ? formatWhen(when) : 'not yet'}</p>
			</li>
		{/each}
	</ul>
</section>
