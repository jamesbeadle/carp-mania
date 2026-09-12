<script lang="ts">
	let { children } = $props();
</script>

<div class="pointer-events-auto absolute inset-0 flex items-center justify-center overflow-y-auto bg-carbon-950/60 p-3 backdrop-blur-sm sm:p-4">
	<div class="w-full max-w-xl">
		{@render children()}
	</div>
</div>
