<script lang="ts">
	import { pointerWords } from '$lib/game/stage/pointerWords';

	let { notice }: { notice: string } = $props();

	const words = $derived(pointerWords(notice));
</script>

<div class="rounded-lg border border-surge-500/50 bg-carbon-950/85 px-4 py-2 text-sm text-mist-100">{words}</div>
