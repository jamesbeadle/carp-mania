<script lang="ts">
	import type { CarpDossier } from '$lib/contracts/CarpDossier';
	import type { CarpOrigin } from '$lib/domain/types';
	import { conditionToneOf } from '$lib/format/conditionTone';
	import { formatMoney } from '$lib/format/money';
	import { formatWeight } from '$lib/format/weight';
	import StatRow from '../stats/StatRow.svelte';
	import { fameTierOf } from './fameTier';
	import PressureLine from './PressureLine.svelte';

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
	const stats = $derived([
		{ label: 'Best ever', value: formatWeight(dossier.bestEverLb), tone: 'volt' as const },
		{ label: 'Age', value: String(carp.age_years), caption: 'yrs' },
		{ label: 'Condition', value: String(condition), caption: '/100', tone: conditionToneOf(condition) },
		{ label: 'Fame', value: String(carp.fame), caption: fameTierOf(carp.fame).toLowerCase() },
		{ label: 'Caught', value: `${carp.times_caught}×`, caption: 'all time' },
		...guidePriceUnlessMine(dossier)
	]);

	function guidePriceUnlessMine(fish: CarpDossier) {
		if (fish.isMine) return [];
		return [{ label: 'Guide price', value: formatMoney(fish.guidePrice) }];
	}
</script>

<StatRow {stats} />
<div class="mt-4"><PressureLine recentCaptures={dossier.recentCaptures} /></div>
<p class="mt-3 text-sm text-mist-200">{origin}</p>
