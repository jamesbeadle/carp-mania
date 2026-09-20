<script lang="ts">
	import type { CarpDossier } from '$lib/contracts/CarpDossier';
	import type { CarpOrigin } from '$lib/domain/types';
	import { conditionTone } from '$lib/format/conditionTone';
	import { formatMoney } from '$lib/format/money';
	import { formatWeight } from '$lib/format/weight';
	import PressureLine from './PressureLine.svelte';
	import FameBadge from './FameBadge.svelte';

	let { dossier }: { dossier: CarpDossier } = $props();

	const OriginStories: Record<CarpOrigin, (lakeName: string) => string> = {
		farm: () => 'From the fish farm',
		wild: (lakeName) => `A wild original of ${lakeName}`,
		bred: (lakeName) => `Bred at ${lakeName}`,
		classic: () => 'One of the originals'
	};

	const carp = $derived(dossier.carp);
	const condition = $derived(Math.round(Number(carp.condition)));
	const originLakeName = $derived(dossier.originLakeName ?? dossier.lake.name);
	const origin = $derived(OriginStories[carp.origin](originLakeName));
</script>

<dl class="grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
	<div><dt class="stat-label">Best ever</dt><dd class="text-xl text-volt-300">{formatWeight(dossier.bestEverLb)}</dd></div>
	<div><dt class="stat-label">Age</dt><dd class="text-xl">{carp.age_years} <span class="text-sm text-mist-400">yrs</span></dd></div>
	<div><dt class="stat-label">Condition</dt><dd class="text-xl {conditionTone(condition)}">{condition}<span class="text-sm text-mist-400">/100</span></dd></div>
	<div><dt class="stat-label">Guide price</dt><dd class="text-xl">{formatMoney(dossier.guidePrice)}</dd></div>
</dl>
<div class="mt-3 flex flex-wrap items-center gap-3 text-sm text-mist-200">
	<FameBadge fame={carp.fame} />
	<span>{origin}</span>
	<span class="text-mist-400">· caught {carp.times_caught}×</span>
	<PressureLine recentCaptures={dossier.recentCaptures} />
</div>
