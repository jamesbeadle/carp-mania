<script lang="ts">
	import '../app.css';
	import NavigationBar from '$lib/components/NavigationBar.svelte';

	let { data, children } = $props();
</script>

<div class="flex min-h-full flex-col">
	{#if data.user}
		<NavigationBar user={data.user} />
	{/if}
	<main class="mx-auto w-full max-w-6xl flex-1 px-4 py-6">
		{@render children()}
	</main>
</div>
