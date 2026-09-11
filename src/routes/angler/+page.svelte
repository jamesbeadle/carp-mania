<script lang="ts">
	import CatchReportList from '$lib/components/CatchReportList.svelte';
	import SkillBars from '$lib/components/angler/SkillBars.svelte';
	import { formatMoney } from '$lib/format/money';
	import { formatWeight } from '$lib/format/weight';

	let { data } = $props();
</script>

<h1 class="mb-6 text-4xl text-volt-300">{data.angler.profile.display_name}</h1>

<div class="grid gap-6 lg:grid-cols-[2fr_3fr]">
	<section class="panel">
		<dl class="mb-6 grid grid-cols-3 gap-3 text-sm">
			<div><dt class="stat-label">Money</dt><dd class="text-xl">{formatMoney(data.angler.profile.money)}</dd></div>
			<div><dt class="stat-label">Landed</dt><dd class="text-xl">{data.angler.totalCatches}</dd></div>
			<div><dt class="stat-label">Personal best</dt><dd class="text-xl">{formatWeight(data.angler.personalBestLb)}</dd></div>
		</dl>
		<h2 class="mb-3 text-xl text-volt-300">Skills</h2>
		<SkillBars profile={data.angler.profile} />
		<p class="mt-4 text-xs text-mist-400">Skills rise with every fish, and faster when the tackle suited the water. Match readouts unlock at 40.</p>
	</section>
	<section class="panel">
		<h2 class="mb-3 text-xl text-volt-300">Catch history</h2>
		<CatchReportList catches={data.angler.catches} />
	</section>
</div>
