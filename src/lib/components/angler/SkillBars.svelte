<script lang="ts">
	import { SkillLabels, SkillNames, type SkillName } from '$lib/domain/anglerSkills';
	import type { Profile } from '$lib/domain/types';

	let { profile, isCompact = false }: { profile: Pick<Profile, SkillName>; isCompact?: boolean } = $props();

	const spacing = $derived(isCompact ? 'space-y-1.5' : 'space-y-3');
	const labelSize = $derived(isCompact ? 'text-xs' : 'text-sm');
	const barHeight = $derived(isCompact ? 'h-1.5' : 'h-2');
</script>

<ul class={spacing}>
	{#each SkillNames as skill (skill)}
		<li>
			<div class="mb-1 flex justify-between {labelSize}"><span>{SkillLabels[skill]}</span><span class="text-volt-300">{Math.round(Number(profile[skill]))}</span></div>
			<div class="{barHeight} overflow-hidden rounded-full bg-carbon-950">
				<div class="h-full rounded-full bg-gradient-to-r from-volt-500 to-surge-500" style="width: {Number(profile[skill])}%"></div>
			</div>
		</li>
	{/each}
</ul>
