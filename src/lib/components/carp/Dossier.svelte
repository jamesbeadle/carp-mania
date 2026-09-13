<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { CarpDossier } from '$lib/contracts/CarpDossier';
	import DossierCard from './DossierCard.svelte';
	import DossierRecord from './DossierRecord.svelte';

	let { dossier, hasListingLink = true, aside }: { dossier: CarpDossier; hasListingLink?: boolean; aside?: Snippet } = $props();
</script>

<div class="grid gap-6 lg:grid-cols-2 lg:items-start">
	<DossierCard {dossier} {hasListingLink} />
	<div class="space-y-6">
		{@render aside?.()}
		<DossierRecord {dossier} />
	</div>
</div>
