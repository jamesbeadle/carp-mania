<script lang="ts">
	let { children } = $props();
</script>

<div class="absolute inset-0 flex items-center justify-center bg-carbon-950/60 p-4 backdrop-blur-sm">
	<div class="w-full max-w-xl">
		{@render children()}
	</div>
</div>
