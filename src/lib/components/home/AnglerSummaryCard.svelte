<script lang="ts">
	import { overallAnglerSkill } from '$lib/domain/anglerSkills';
	import type { Profile } from '$lib/domain/types';
	import { formatMoney } from '$lib/format/money';

	let { profile }: { profile: Profile } = $props();

	const skill = $derived(overallAnglerSkill({
		line_selection: Number(profile.line_selection),
		rig_selection: Number(profile.rig_selection),
		bait_selection: Number(profile.bait_selection),
		watercraft: Number(profile.watercraft)
	}));
</script>

<section class="panel">
	<p class="stat-label">My angler</p>
	<h2 class="mb-4 text-3xl text-volt-300">{profile.display_name}</h2>
	<dl class="grid grid-cols-2 gap-4 text-sm">
		<div><dt class="stat-label">Money</dt><dd class="text-2xl">{formatMoney(profile.money)}</dd></div>
		<div><dt class="stat-label">Overall skill</dt><dd class="text-2xl">{Math.round(skill)}</dd></div>
		<div><dt class="stat-label">Fish landed</dt><dd class="text-2xl">{profile.experience}</dd></div>
	</dl>
	<div class="mt-5 flex gap-3">
		<a href="/lakes" class="button-primary">Find a water to fish</a>
		<a href="/angler" class="button-secondary">My profile</a>
	</div>
</section>
