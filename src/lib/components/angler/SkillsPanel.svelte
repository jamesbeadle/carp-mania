<script lang="ts">
	import type { SkillName } from '$lib/domain/anglerSkills';
	import type { Profile } from '$lib/domain/types';
	import AboutToggle from '../stats/AboutToggle.svelte';
	import StatRow from '../stats/StatRow.svelte';
	import SkillBars from './SkillBars.svelte';

	interface Stat {
		label: string;
		value: string;
		caption?: string;
		tone?: 'volt' | 'mist';
	}

	let { stats, profile, isMine = false }: { stats: Stat[]; profile: Pick<Profile, SkillName>; isMine?: boolean } = $props();
</script>

<section class="panel">
	<StatRow {stats} />
	<h2 class="mt-6 mb-3 text-xl text-volt-300">Skills</h2>
	<SkillBars {profile} />
	{#if isMine}
		<div class="mt-4">
			<AboutToggle title="About the skills">Line selection is how invisible your line is; rig selection how well the rig suits the spot; bait selection what the fish trust; watercraft finding the fish and reading the bite. Every fish landed raises them, faster when the tackle suited the water. Match readouts unlock at craft 40.</AboutToggle>
		</div>
	{/if}
</section>
