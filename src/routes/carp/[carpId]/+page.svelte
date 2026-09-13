<script lang="ts">
	import Dossier from '$lib/components/carp/Dossier.svelte';
	import MemorialDossier from '$lib/components/carp/MemorialDossier.svelte';
	import OwnerActions from '$lib/components/carp/OwnerActions.svelte';

	let { data } = $props();
</script>

<svelte:head><title>{data.memorial?.memorial.name ?? data.dossier?.carp.name ?? 'A carp'} · Carp Mania</title></svelte:head>

{#if data.memorial}
	<div class="mx-auto max-w-3xl"><MemorialDossier dossier={data.memorial} /></div>
{:else if data.dossier}
	{@const dossier = data.dossier}
	<Dossier {dossier}>
		{#snippet aside()}
			{#if dossier.isMine}<OwnerActions {dossier} />{/if}
		{/snippet}
	</Dossier>
{/if}
