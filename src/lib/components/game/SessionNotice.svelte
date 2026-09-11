<script lang="ts">
	let { notice }: { notice: string } = $props();
</script>

<div class="pointer-events-none absolute right-3 bottom-3 max-w-sm rounded-lg border border-surge-500/50 bg-carbon-950/85 px-4 py-2 text-sm text-mist-100 backdrop-blur">
	{notice}
</div>
