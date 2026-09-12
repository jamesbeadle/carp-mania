<script lang="ts">
	import { pointerWords } from '$lib/game/stage/pointerWords';

	let { notice, isDocked = false }: { notice: string; isDocked?: boolean } = $props();

	const words = $derived(pointerWords(notice));
</script>

<div class="pointer-events-none rounded-lg border border-surge-500/50 bg-carbon-950/85 px-4 py-2 text-sm text-mist-100 backdrop-blur" class:absolute={!isDocked} class:right-3={!isDocked} class:bottom-3={!isDocked} class:max-w-sm={!isDocked}>
	{words}
</div>
