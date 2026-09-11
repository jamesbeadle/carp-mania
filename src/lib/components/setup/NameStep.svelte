<script lang="ts">
	import { WizardStep } from '$lib/contracts/SetupProgress';
	import { WaterName } from '$lib/domain/sites/newLake';
	import { SiteCatalogue } from '$lib/domain/sites/siteCatalogue';
	import type { Lake } from '$lib/domain/types';
	import { RegionCatalogue } from '$lib/domain/world/regions';

	let { lake }: { lake: Lake } = $props();
</script>

<section class="panel mx-auto max-w-2xl">
	<p class="stat-label">Yours now</p>
	<h2 class="mb-1 text-2xl text-volt-300">Name your water</h2>
	<p class="mb-4 text-sm text-mist-400">
		{SiteCatalogue[lake.site_type].label}, {Number(lake.plot_acres)} acres in {RegionCatalogue[lake.region].label}. The name goes on the globe, the day tickets and every catch report.
	</p>
	<form method="POST" action="?/rename" class="flex gap-2">
		<input name="name" value={lake.name} minlength={WaterName.MinimumLength} maxlength={WaterName.MaximumLength} class="field font-display text-2xl" aria-label="Water name" />
		<button class="button-secondary">Rename</button>
	</form>
	<footer class="mt-6 flex items-center gap-3">
		<a href="?step={WizardStep.Survey}" class="button-primary ml-auto">Survey it →</a>
	</footer>
</section>
