<script lang="ts">
	import { SkillLabels, SkillNames } from '$lib/domain/anglerSkills';
	import type { Profile } from '$lib/domain/types';

	let { profile }: { profile: Profile } = $props();
</script>

<ul class="space-y-3">
	{#each SkillNames as skill (skill)}
		<li>
			<div class="mb-1 flex justify-between text-sm"><span>{SkillLabels[skill]}</span><span class="text-volt-300">{Math.round(Number(profile[skill]))}</span></div>
			<div class="h-2 overflow-hidden rounded-full bg-carbon-950">
				<div class="h-full rounded-full bg-gradient-to-r from-volt-500 to-surge-500" style="width: {Number(profile[skill])}%"></div>
			</div>
		</li>
	{/each}
</ul>
