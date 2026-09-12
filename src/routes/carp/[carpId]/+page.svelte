<script lang="ts">
	import Dossier from '$lib/components/carp/Dossier.svelte';
	import MemorialDossier from '$lib/components/carp/MemorialDossier.svelte';
	import OwnerActions from '$lib/components/carp/OwnerActions.svelte';

	let { data } = $props();
</script>

{#if data.memorial}
	<div class="mx-auto max-w-3xl"><MemorialDossier dossier={data.memorial} /></div>
{:else if data.dossier}
	<div class="grid gap-6 lg:grid-cols-[3fr_2fr]">
		<Dossier dossier={data.dossier} />
		{#if data.dossier.isMine}
			<OwnerActions dossier={data.dossier} />
		{/if}
	</div>
{/if}
