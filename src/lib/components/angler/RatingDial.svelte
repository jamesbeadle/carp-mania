<script lang="ts">
	import { Pedigree, whatHoldsRatingBack, type AnglerRating, type Skills } from '$lib/domain/anglerRating';
	import { formatWeight } from '$lib/format/weight';
	import AboutToggle from '../stats/AboutToggle.svelte';
	import StatRow from '../stats/StatRow.svelte';

	let { rating, skills }: { rating: AnglerRating; skills: Skills } = $props();

	const Dial = { Radius: 44, Circumference: 2 * Math.PI * 44, Size: 112 } as const;
	const NoFishYet = 'no fish yet';
	const dashOffset = $derived(Dial.Circumference * (1 - rating.rating / 100));
	const centre = Dial.Size / 2;
	const bestWords = $derived(rating.heaviestLandedLb > 0 ? `best fish ${formatWeight(rating.heaviestLandedLb)}` : NoFishYet);
	const stats = $derived([
		{ label: 'Craft', value: String(Math.round(rating.craft)) },
		{ label: 'Pedigree', value: String(Math.round(rating.pedigree)), caption: bestWords }
	]);
</script>

<section class="panel flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
	<div class="flex shrink-0 flex-col items-center gap-1 self-start sm:self-center">
		<svg width={Dial.Size} height={Dial.Size} viewBox="0 0 {Dial.Size} {Dial.Size}" class="shrink-0" role="img" aria-label="Rating {Math.round(rating.rating)} out of 100">
			<circle cx={centre} cy={centre} r={Dial.Radius} fill="none" stroke="var(--color-carbon-950)" stroke-width="10" />
			<circle cx={centre} cy={centre} r={Dial.Radius} fill="none" stroke="var(--color-volt-500)" stroke-width="10" stroke-linecap="round" stroke-dasharray={Dial.Circumference} stroke-dashoffset={dashOffset} transform="rotate(-90 {centre} {centre})" />
			<text x="50%" y="54%" text-anchor="middle" dominant-baseline="middle" class="fill-volt-300 font-display text-3xl font-bold italic">{Math.round(rating.rating)}</text>
		</svg>
		<p class="stat-label">Rating</p>
	</div>
	<div class="flex min-w-0 flex-1 flex-col gap-3">
		<div class="max-w-sm"><StatRow {stats} /></div>
		<p class="text-sm leading-snug text-mist-100">{whatHoldsRatingBack(rating, skills)}</p>
		<AboutToggle title="About the rating">The lesser of your craft — the average of the four skills — and your pedigree, {Pedigree.PointsPerPound} points a pound of your best fish. A {Pedigree.CapLb} is the lot.</AboutToggle>
	</div>
</section>
