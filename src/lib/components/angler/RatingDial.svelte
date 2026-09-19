<script lang="ts">
	import { whatHoldsRatingBack, type AnglerRating, type Skills } from '$lib/domain/anglerRating';
	import { formatWeight } from '$lib/format/weight';

	let { rating, skills }: { rating: AnglerRating; skills: Skills } = $props();

	const Dial = { Radius: 44, Circumference: 2 * Math.PI * 44, Size: 112 } as const;
	const dashOffset = $derived(Dial.Circumference * (1 - rating.rating / 100));
	const centre = Dial.Size / 2;
	const craft = $derived(Math.round(rating.craft));
	const pedigree = $derived(Math.round(rating.pedigree));
	const bestWords = $derived(rating.heaviestLandedLb > 0 ? `(${formatWeight(rating.heaviestLandedLb)})` : '(no fish yet)');
</script>

<section class="panel flex flex-wrap items-center gap-5">
	<svg width={Dial.Size} height={Dial.Size} viewBox="0 0 {Dial.Size} {Dial.Size}" class="shrink-0" role="img" aria-label="Rating {Math.round(rating.rating)} out of 100">
		<circle cx={centre} cy={centre} r={Dial.Radius} fill="none" stroke="var(--color-carbon-950)" stroke-width="10" />
		<circle cx={centre} cy={centre} r={Dial.Radius} fill="none" stroke="var(--color-volt-500)" stroke-width="10" stroke-linecap="round" stroke-dasharray={Dial.Circumference} stroke-dashoffset={dashOffset} transform="rotate(-90 {centre} {centre})" />
		<text x="50%" y="54%" text-anchor="middle" dominant-baseline="middle" class="fill-volt-300 font-display text-3xl font-bold italic">{Math.round(rating.rating)}</text>
	</svg>
	<div class="min-w-0 flex-1">
		<p class="stat-label">Rating</p>
		<p class="text-lg text-mist-100">Craft {craft} · Pedigree {pedigree} <span class="text-mist-400">{bestWords}</span></p>
		<p class="mt-1 text-sm text-mist-400">{whatHoldsRatingBack(rating, skills)}</p>
		<p class="mt-2 text-xs text-mist-400">Your rating is the lesser of your craft — the four skills — and your pedigree, two points a pound of your best fish. A fifty is the lot.</p>
	</div>
</section>
