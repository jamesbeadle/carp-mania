<script lang="ts">
	import LegalPage from '$lib/components/legal/LegalPage.svelte';
	import { PrivacyPolicy } from '$lib/legal/privacyPolicy';
</script>

<svelte:head><title>Privacy · Carp Mania</title></svelte:head>

<LegalPage document={PrivacyPolicy} />
