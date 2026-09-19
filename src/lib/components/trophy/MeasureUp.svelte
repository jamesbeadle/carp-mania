<script lang="ts">
	import type { MeasureUp, Measures } from '$lib/contracts/TrophyRoom';
	import { edgeOf, toBeatWords, type Edge } from '$lib/domain/trophies/measureUp';
	import { formatWeight } from '$lib/format/weight';

	let { measureUp }: { measureUp: MeasureUp } = $props();

	interface Row {
		label: string;
		theirs: string;
		yours: string;
		edge: Edge;
	}

	const EdgeColour: Record<Edge, string> = { ahead: 'text-volt-300', level: 'text-mist-200', behind: 'text-danger-400' };
	const EdgeWord: Record<Edge, string> = { ahead: 'ahead', level: 'level', behind: 'behind' };

	const rows = $derived<Row[]>([
		row('Personal best', measureUp.theirs, measureUp.yours, 'personalBestLb', formatWeight),
		row('Fish landed', measureUp.theirs, measureUp.yours, 'fishLanded', String),
		row('Rating', measureUp.theirs, measureUp.yours, 'rating', (skill) => String(Math.round(skill))),
		row('Records held', measureUp.theirs, measureUp.yours, 'recordsHeld', String),
		row('Trophies', measureUp.theirs, measureUp.yours, 'trophies', String)
	]);
	const verdict = $derived(toBeatWords(measureUp.theirName, measureUp.yours, measureUp.theirs));

	function row(label: string, theirs: Measures, yours: Measures, measure: keyof Measures, format: (value: number) => string): Row {
		return { label, theirs: format(theirs[measure]), yours: format(yours[measure]), edge: edgeOf(yours[measure], theirs[measure]) };
	}
</script>

<section class="panel border-surge-500/40">
	<p class="stat-label">How you measure up</p>
	<p class="mt-1 mb-3 text-lg text-mist-100">{verdict}</p>
	<table class="w-full text-sm">
		<thead class="stat-label text-left"><tr><th class="py-1 font-normal"></th><th class="py-1 font-normal">{measureUp.theirName}</th><th class="py-1 font-normal">You</th><th class="py-1 font-normal"></th></tr></thead>
		<tbody class="divide-y divide-carbon-700/60">
			{#each rows as measure (measure.label)}
				<tr>
					<td class="py-1.5 text-mist-400">{measure.label}</td>
					<td class="py-1.5 text-mist-100">{measure.theirs}</td>
					<td class="py-1.5 text-mist-100">{measure.yours}</td>
					<td class={['py-1.5 text-right text-xs uppercase', EdgeColour[measure.edge]]}>{EdgeWord[measure.edge]}</td>
				</tr>
			{/each}
		</tbody>
	</table>
</section>
