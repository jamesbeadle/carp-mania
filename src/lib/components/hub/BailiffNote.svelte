<script lang="ts">
	import type { WhileYouWereAway as Summary } from '$lib/contracts/WhileYouWereAway';
	import WhileYouWereAway from '../home/WhileYouWereAway.svelte';
	import PlaceSheet from '../stage/PlaceSheet.svelte';

	let { summary, isOpen, onClose }: { summary: Summary; isOpen: boolean; onClose: () => void } = $props();
</script>

<PlaceSheet title="From the bailiff" {isOpen} {onClose}>
	<p class="text-sm text-mist-400">A note left on the lodge door while you were away.</p>
	<WhileYouWereAway {summary} />
	<button class="button-primary w-full" onclick={onClose}>Down to the water</button>
</PlaceSheet>
