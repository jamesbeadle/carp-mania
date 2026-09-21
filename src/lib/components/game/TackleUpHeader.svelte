<script lang="ts">
	import { streakWords } from '$lib/domain/fishing/streak';
	import type { Terrain } from '$lib/domain/layout/terrainAt';
	import { MaximumRods, type RodSetup } from '$lib/domain/tackle/rodSetup';
	import type { Lake, Swim } from '$lib/domain/types';
	import type { Season } from '$lib/domain/world/seasons';
	import type { RodSetShelf } from '$lib/game/session/rodSetShelf.svelte';
	import SegmentedChoice from './SegmentedChoice.svelte';
	import SetupShelf from './SetupShelf.svelte';
	import SizeReachLine from './SizeReachLine.svelte';
	import TackleUpStats from './TackleUpStats.svelte';

	interface Props {
		lake: Lake;
		swim: Swim;
		season: Season;
		terrain: Terrain;
		rating: number;
		carpCount: number;
		conditionsShare: number;
		streakDays: number;
		shownSetup: RodSetup;
		shelf: RodSetShelf;
		hasLastTime: boolean;
		rodCount: number;
		onRodCount: (count: number) => void;
		onPickSet: (setId: string) => void;
		onSaveSet: (name: string) => void;
	}

	let { lake, swim, season, terrain, rating, carpCount, conditionsShare, streakDays, shownSetup, shelf, hasLastTime, rodCount, onRodCount, onPickSet, onSaveSet }: Props = $props();

	const RodCounts = Array.from({ length: MaximumRods }, (_, index) => index + 1);
</script>

<section class="panel mb-4 space-y-4">
	<div>
		<p class="stat-label">Tackle up at</p>
		<h2 class="text-2xl text-volt-300">{swim.name}</h2>
	</div>
	<TackleUpStats {lake} {terrain} {season} />
	<div class="grid gap-4 md:grid-cols-[minmax(0,1fr)_auto]">
		<div class="min-w-0"><SetupShelf {shelf} {hasLastTime} onPick={onPickSet} onSave={onSaveSet} /></div>
		<div class="w-full max-w-xs">
			<p class="stat-label mb-1">Rods</p>
			<SegmentedChoice choices={RodCounts} chosen={rodCount} labelFor={(count) => `${count}`} onChoose={onRodCount} ariaLabel="How many rods" />
			<p class="mt-2 text-xs text-volt-300">{streakWords(streakDays)}</p>
		</div>
	</div>
	<SizeReachLine {lake} {rating} {carpCount} {conditionsShare} {terrain} setup={shownSetup} />
</section>
