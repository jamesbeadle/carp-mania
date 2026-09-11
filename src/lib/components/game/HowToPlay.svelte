<script lang="ts">
	const steps = [
		{ title: 'Choose a swim', detail: 'The peg is only where you stand. Pick one with the water you want in range — an island, a bar, the snags, the reeds — and remember the island blocks a cast.' },
		{ title: 'Tackle up', detail: 'Up to three rods. Clear line hides in clear water; coloured line hides in coloured water. Matt hooks, size 4 or 6. Fish the bait the lake has been fed on. Your setup is remembered.' },
		{ title: 'Cast to a spot', detail: 'Click the water once per rod. The spot you land on decides the bottom, the depth and the feature — the rod card tells you what you are on. Silt and weed want a chod or helicopter; clean gravel fishes a Ronnie or spinner.' },
		{ title: 'Read the water', detail: 'Island margins, snags, gravel bars and lily pads all fish better than open water. Every carp has a favourite spot, and a bait on it is the one that fish takes first. From watercraft 50 you will see fish showing over theirs.' },
		{ title: 'Mind the season', detail: 'Summer bites come fast in shallow water and over the pads and weed. In winter the fish sit in the deepest hole and the shallows go dead — the clock tells you which it is. Dawn and dusk are best all year.' },
		{ title: 'Strike and play it', detail: 'When the alarm screams, click STRIKE or press Enter within four seconds. Hold REEL or Space while the fish tires; let go when it runs. Too tight snaps the line, too slack and the hook falls out.' },
		{ title: 'On the mat', detail: 'Every landed carp is photographed and posted to the lake. A fish nobody had seen before goes in the book under your name. Your skills go up, and so does the fishery.' }
	];
</script>

<details class="panel group">
	<summary class="cursor-pointer font-display text-lg font-bold tracking-wide text-volt-300 uppercase select-none">How to play <span class="text-mist-400 group-open:hidden">— show</span><span class="hidden text-mist-400 group-open:inline">— hide</span></summary>
	<ol class="mt-4 grid gap-4 md:grid-cols-2">
		{#each steps as step, index (step.title)}
			<li class="flex gap-3">
				<span class="font-display text-3xl font-extrabold text-surge-500 italic tabular-nums">{index + 1}</span>
				<div><h4 class="font-display text-base font-bold tracking-wide text-mist-100 uppercase">{step.title}</h4><p class="text-sm text-mist-400">{step.detail}</p></div>
			</li>
		{/each}
	</ol>
</details>
