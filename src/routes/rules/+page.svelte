<script lang="ts">
	import RuleBookPage from '$lib/components/rules/RuleBookPage.svelte';

	let { data } = $props();
</script>

<svelte:head><title>The rule book · Carp Mania</title></svelte:head>

<RuleBookPage isSignedIn={data.user !== null} />
