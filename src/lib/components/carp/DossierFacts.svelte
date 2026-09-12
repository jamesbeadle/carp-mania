<script lang="ts">
	import type { CarpDossier } from '$lib/contracts/CarpDossier';
	import type { CarpOrigin } from '$lib/domain/types';
	import { conditionTone } from '$lib/format/conditionTone';
	import { formatMoney } from '$lib/format/money';
	import { formatWeight } from '$lib/format/weight';
	import FameBadge from './FameBadge.svelte';

	let { dossier }: { dossier: CarpDossier } = $props();

	const OriginStories: Record<CarpOrigin, (lakeName: string) => string> = {
		farm: () => 'From the fish farm',
		wild: (lakeName) => `A wild original of ${lakeName}`,
		bred: (lakeName) => `Bred at ${lakeName}`,
		classic: () => 'One of the originals'
	};

	const origin = $derived(OriginStories[dossier.carp.origin](dossier.originLakeName ?? dossier.lake.name));
</script>

<dl class="grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
	<div><dt class="stat-label">Best ever</dt><dd class="text-2xl text-volt-300">{formatWeight(dossier.bestEverLb)}</dd></div>
	<div><dt class="stat-label">Age</dt><dd class="text-2xl">{dossier.carp.age_years} <span class="text-sm text-mist-400">yrs</span></dd></div>
	<div><dt class="stat-label">Condition</dt><dd class="text-2xl {conditionTone(Number(dossier.carp.condition))}">{Math.round(Number(dossier.carp.condition))}<span class="text-sm text-mist-400">/100</span></dd></div>
	<div><dt class="stat-label">Guide price</dt><dd class="text-2xl">{formatMoney(dossier.guidePrice)}</dd></div>
</dl>
<div class="mt-3 flex flex-wrap items-center gap-3 text-sm text-mist-200">
	<FameBadge fame={dossier.carp.fame} />
	<span>{origin}</span>
	<span class="text-mist-400">· caught {dossier.carp.times_caught}×</span>
</div>
