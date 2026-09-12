<script lang="ts">
	import Dossier from '$lib/components/carp/Dossier.svelte';
	import OwnerActions from '$lib/components/carp/OwnerActions.svelte';

	let { data } = $props();
</script>

<div class="grid gap-6 lg:grid-cols-[3fr_2fr]">
	<Dossier dossier={data.dossier} />
	{#if data.dossier.isMine}
		<OwnerActions dossier={data.dossier} />
	{/if}
</div>
