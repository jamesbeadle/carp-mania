<script lang="ts">
	import type { NameAvailability } from '$lib/contracts/AnglerLicence';

	let { availability, isChecking }: { availability: NameAvailability | null; isChecking: boolean } = $props();
</script>

<p class="min-h-6 text-sm" aria-live="polite">
	{#if isChecking}
		<span class="text-mist-400">Checking the register…</span>
	{:else if availability?.isFree}
		<span class="font-bold text-volt-400">✓ {availability.reason}</span>
	{:else if availability}
		<span class="text-danger-400">✗ {availability.reason}</span>
	{/if}
</p>
