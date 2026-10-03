<script lang="ts">
	let { onback, onnext, nextWords, isNextBlocked = false }: { onback: () => void; onnext: () => void; nextWords: string; isNextBlocked?: boolean } = $props();
</script>

<footer class="flex items-center gap-3 border-t border-carbon-700 pt-4">
	<button type="button" class="text-sm text-mist-400 hover:text-mist-100" onclick={onback}>← Back</button>
	<button type="button" class="button-primary ml-auto" disabled={isNextBlocked} onclick={onnext}>{nextWords}</button>
</footer>
