<script lang="ts">
	import { SwimMoveWords } from '$lib/domain/fishing/movingSwims';
	import { RuleBookPath } from '$lib/rules/ruleBook';
	import PlaceSheet from '../stage/PlaceSheet.svelte';

	let { isOpen, onClose }: { isOpen: boolean; onClose: () => void } = $props();

	const steps = [
		{ title: 'Choose a swim', detail: `The peg is only where you stand; pick one with the water you want in range. Move swim brings the rods in and costs ${SwimMoveWords.Duration}.` },
		{ title: 'Tackle up', detail: 'Up to three rods, remembered between sessions. Line that hides in the water, matt hooks, the bait the lake has been fed on.' },
		{ title: 'Cast to a spot', detail: 'Tap the water once per rod. The spot decides the bottom, the depth and the feature, and the rod card tells you what you are on.' },
		{ title: 'Read the water', detail: 'Margins, snags, bars and pads all fish better than open water. Every carp has a favourite spot, and a bait on it is the one that fish takes first.' },
		{ title: 'Mind the season', detail: 'Summer fish sit shallow and over the weed; winter fish sit in the deepest hole. Dawn and dusk bring the bites all year.' },
		{ title: 'Strike and play it', detail: 'When the alarm screams, hit STRIKE (or Enter) within four seconds. Hold REEL (or Space) while the fish tires, and let go when the bar warns of a run.' },
		{ title: 'On the mat', detail: 'Every landed carp is weighed, photographed and posted to the lake, and any record is called on the spot. Your skills go up, and so does the fishery.' }
	];
</script>

<PlaceSheet title="How to play" {isOpen} {onClose}>
	<ol class="grid gap-4">
		{#each steps as step, index (step.title)}
			<li class="flex gap-3">
				<span class="font-display text-3xl font-extrabold text-surge-500 italic tabular-nums">{index + 1}</span>
				<div><h4 class="font-display text-base font-bold tracking-wide text-mist-100 uppercase">{step.title}</h4><p class="text-sm text-mist-400">{step.detail}</p></div>
			</li>
		{/each}
	</ol>
	<a href={RuleBookPath} class="mt-5 inline-block text-sm text-surge-400 hover:underline">Every rule, in questions and answers — the rule book →</a>
</PlaceSheet>
