<script lang="ts">
	import { difficultyWord, lakeDifficultyOf, whatWouldEaseIt, type DifficultyReading as DifficultyReadingShares } from '$lib/domain/lakeDifficulty';
	import type { Shoal } from '$lib/domain/stock/shoals';
	import { headCountIn } from '$lib/domain/stock/headCount';
	import type { Carp, Lake } from '$lib/domain/types';

	interface Props {
		lake: Lake;
		carp: Carp[];
		shoals: Shoal[];
		isOwner?: boolean;
	}

	let { lake, carp, shoals, isOwner = false }: Props = $props();

	const reading = $derived(lakeDifficultyOf(lake, headCountIn(carp, shoals)));
	const word = $derived(difficultyWord(reading.difficulty));
	const percent = (factor: number) => Math.round(factor * 100);
	const factorWords = $derived(sharesOf(reading).map(([name, factor]) => `${name} ${percent(factor)}%`).join(' · '));

	function sharesOf(read: DifficultyReadingShares) {
		const { sizeSpread, stockingFactor, featureFactor, qualityFactor } = read;
		return [['Size', sizeSpread], ['stocking', stockingFactor], ['features', featureFactor], ['water', qualityFactor]] as const;
	}
</script>

<div class="rounded-xl border border-carbon-700/60 bg-carbon-900/60 p-4">
	<p class="stat-label">Difficulty</p>
	<p class="text-2xl text-volt-300">{reading.difficulty} <span class="text-base text-mist-200">· {word}</span></p>
	<p class="mt-1 text-xs text-mist-400">
		{factorWords}.
		A hard water does not give up fewer fish — the good spots are simply fewer and further apart, and the big fish are on it.
	</p>
	{#if isOwner}<p class="mt-1 text-xs text-mist-200">To ease it: {whatWouldEaseIt(reading)}.</p>{/if}
</div>
