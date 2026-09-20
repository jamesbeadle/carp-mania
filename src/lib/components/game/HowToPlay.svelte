<script lang="ts">
	import { SwimMoveWords } from '$lib/domain/fishing/movingSwims';
	import PlaceSheet from '../stage/PlaceSheet.svelte';

	let { isOpen, onClose }: { isOpen: boolean; onClose: () => void } = $props();

	const steps = [
		{ title: 'Choose a swim', detail: `The peg is only where you stand. Pick one with the water you want in range — an island, a bar, the snags, the reeds — and remember the island blocks a cast. You can move later: Move swim brings the rods in and costs ${SwimMoveWords.Duration}.` },
		{ title: 'Tackle up', detail: 'Up to three rods. Clear line hides in clear water; coloured line hides in coloured water. Matt hooks, size 4 or 6. Fish the bait the lake has been fed on. Your setup is remembered.' },
		{ title: 'Cast to a spot', detail: 'Tap the water once per rod. The spot you land on decides the bottom, the depth and the feature — the rod card tells you what you are on. Silt and weed want a chod or helicopter; clean gravel fishes a Ronnie or spinner.' },
		{ title: 'Read the water', detail: 'Island margins, snags, gravel bars and lily pads all fish better than open water. Every carp has a favourite spot, and a bait on it is the one that fish takes first. Listen for fish crashing out; from watercraft 50 you will see where they showed.' },
		{ title: 'Mind the season', detail: 'Summer bites come fast in shallow water and over the pads and weed. In winter the fish sit in the deepest hole and the shallows go dead — the clock tells you which it is. Dawn and dusk are best all year, and the fish keep feeding in the dark — the day runs to midnight.' },
		{ title: 'Strike and play it', detail: 'When the alarm screams, hit STRIKE (or Enter) within four seconds — a beat longer as your watercraft rises. Hold REEL (or Space) while the fish tires; the bar warns a beat before a run, so let go and let it take line. Too tight snaps the line, too slack and the hook falls out.' },
		{ title: 'On the mat', detail: 'Every landed carp goes on the scales, is photographed and posted to the lake. Personal bests and lake, region and world records are called on the spot. A fish nobody had seen before goes in the book under your name. Your skills go up, and so does the fishery. Your rating is the lesser of your craft and the biggest fish you have landed — two points a pound, a fifty for the lot.' }
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
</PlaceSheet>
