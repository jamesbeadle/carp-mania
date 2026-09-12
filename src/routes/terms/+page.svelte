<script lang="ts">
	import LegalPage from '$lib/components/legal/LegalPage.svelte';
	import { TermsOfService } from '$lib/legal/termsOfService';
</script>

<svelte:head><title>Terms · Carp Mania</title></svelte:head>

<LegalPage document={TermsOfService} />
